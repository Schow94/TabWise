package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID       uint64 `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
}

type customClaims struct {
	Id       uint64 `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	jwt.StandardClaims
}

type Image struct {
	FileData *multipart.FileHeader `form:"file"`
}

type Receipt struct {
	ID               int
	User_Id          int
	Receipt_Price    float64
	Num_People       int
	Transaction_Date string
	Category         string
	Receipt_PPP      float64
	Vendor_Name      string
	Vendor_Address   string
	Vendor_Phone     string
	Vendor_URL       string
	Payment          string
}

type Item struct {
	ID          int
	Receipt_ID  int
	Description string
	Item_Price  float64
	Quantity    float64
	Item_PPP    float64
}

var db *sql.DB

// Load env contents
func init() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

// ------------------ JWT LOGIC ------------------
func CreateToken(id uint64, username string, email string) (string, error) {
	var err error
	//Creating Access Token
	// os.Setenv("ACCESS_SECRET", "jdnfksdmfksd") //this should be in an env file

	claims := customClaims{
		Id:       id,
		Username: username,
		Email:    email,

		StandardClaims: jwt.StandardClaims{
			// 15 min
			ExpiresAt: time.Now().Add(time.Minute * 15).Unix(),
			Issuer:    "TabWise",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(os.Getenv("ACCESS_SECRET")))

	if err != nil {
		return "", err
	}
	return signedToken, nil
}

// func ExtractToken(r *http.Request) string {
//     bearToken := r.Header.Get("Authorization")
//     //normally Authorization the_token_xxx
//     strArr := strings.Split(bearToken, " ")
//     if len(strArr) == 2 {
//         return strArr[1]
//     }
//     return ""
// }

// func VerifyToken(r *http.Request) (*jwt.Token, error) {
//     tokenString := ExtractToken(r)
//     token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
//        //Make sure that the token method conform to "SigningMethodHMAC"
//        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
//           return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
//        }
//        return []byte(os.Getenv("ACCESS_SECRET")), nil
//     })
//     if err != nil {
//        return nil, err
//     }
//     return token, nil
// }

// func TokenValid(r *http.Request) error {
//     token, err := VerifyToken(r)
//     if err != nil {
//        return err
//     }
//     if _, ok := token.Claims.(jwt.Claims); !ok && !token.Valid {
//        return err
//     }
//     return nil
// }

// ------------------------------- AUTH ROUTES -------------------------------
// ------------------------------- LOGIN ROUTE -------------------------------
func Login(c *gin.Context) {
	var u User // u is json we receive from POST request
	var foundUser User

	if err := c.ShouldBindJSON(&u); err != nil {
		c.JSON(http.StatusUnprocessableEntity, "Invalid json provided")
		return
	}
	// // Initialize Postgres db
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  "user=stephenchow dbname=tabwise",
		PreferSimpleProtocol: true, // disables implicit prepared statement usage
	}), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("PROVIDED USER: ", u.Username)
	// Query db for that username (unique)
	db.Where("username = ?", u.Username).First(&foundUser)
	fmt.Println("FOUND USER: ", foundUser)
	// Compare hashed pw to pw provided by person
	// If hash is valid, issue JWT to user

	// Send user's info in header of jwt??
	// username, email, etc

	fmt.Println("HASH: ", string(u.Password))

	// Compare the entered password vs stored hashed pw
	if err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(u.Password)); err != nil {
		c.JSON(401, gin.H{
			"message": "Invalid credentials",
		})
		fmt.Println("Error: ", err)
		return
	}

	// Valid credentials
	fmt.Println("Password was correct!")

	// Send back token to user if credentials are valid
	token, err := CreateToken(foundUser.ID, foundUser.Username, foundUser.Email)
	// Need to handle when credentials are wrong - currently kills the server
	if err != nil {
		c.JSON(http.StatusUnprocessableEntity, err.Error())

	}
	c.JSON(http.StatusOK, token)
}

// ------------------------------- SIGNUP ROUTE -------------------------------
func SignUp(c *gin.Context) {
	var u User // u is json we receive from POST request

	if err := c.ShouldBindJSON(&u); err != nil {
		c.JSON(http.StatusUnprocessableEntity, "Invalid json provided")
		return
	}

	// Initialize Postgres db
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  "user=stephenchow dbname=tabwise",
		PreferSimpleProtocol: true, // disables implicit prepared statement usage
	}), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	// Generate "hash" to store from user password - Only for initial signup
	hashedPw, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"code":    http.StatusOK,
			"message": "Uh oh! Something went wrong. Please try again", // cast it to string before showing
		})
		log.Fatal(err)
	}

	fmt.Println("HASH: ", string(hashedPw))

	// Need to add logic to check if the user already has an account
	// Send message to user saying that they already have an account

	var newUser = User{
		Username: u.Username,
		Password: string(hashedPw),
		Email:    u.Email,
	}

	// Store new user's credentials in db (INSERT)
	db.Create(&newUser)

	// Send back token to user if successfully create account for new user
	token, err := CreateToken(u.ID, u.Username, u.Email)
	// Need to handle when credentials are wrong - currently kills the server
	if err != nil {
		c.JSON(http.StatusUnprocessableEntity, err.Error())

	}
	c.JSON(http.StatusOK, token)

}

// ------------------ CRUD ROUTES ------------------
func ImageUpload(c *gin.Context) {
	fmt.Println("IMAGE ROUTE!!!")

	file, header, err := c.Request.FormFile("image")
	filename := header.Filename

	// Save receipt to tmp directory temporarily while we extract json from it
	out, err := os.Create("./tmp/" + filename)

	if err != nil {
		log.Fatal(err)
	}

	defer os.Remove(out.Name())
	defer out.Close()

	// Timeout to confirm that I'm actually saving photo to directory for a second
	time.Sleep(time.Second * 3)

	fmt.Println("IMAGE: ", header.Filename)

	_, err = io.Copy(out, file)
	if err != nil {
		log.Fatal(err)
	}

	// Extract data using OCR microservice here
	// Save results temporarily to results.json
	// Read results.json & send back to client until I have the microservice
	extractedData := extractReceipt()
	c.JSON(http.StatusOK, extractedData)
}

// Extracts data from receipt & sends back json to client
func extractReceipt() map[string]interface{} {
	fmt.Println("Extracting receipt!!!")
	jsonFile, err := os.Open("results.json")
	// if we os.Open returns an error then handle it
	if err != nil {
		fmt.Println(err)
	}

	fmt.Println("Opening results.json")

	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	fmt.Println("Reading results.json")

	var result map[string]interface{}
	json.Unmarshal([]byte(byteValue), &result)

	// defer the closing of our jsonFile so that we can parse it later on
	return result
}

// Get Receipts
func GetReceipts(c *gin.Context) {
	fmt.Println("GET RECEIPTS ROUTE")

	extractedData := findReceipts()
	c.JSON(http.StatusOK, extractedData)
}

// Find all receipts from "db"
func findReceipts() []map[string]interface{} {
	fmt.Println("Finding receipts!!!")
	jsonFile, err := os.Open("receipts.json")
	// if we os.Open returns an error then handle it
	if err != nil {
		fmt.Println(err)
	}

	fmt.Println("Opening receipts.json")

	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	fmt.Println("Reading results.json")

	// Save receipts.json to arr of JSON
	var result []map[string]interface{}
	json.Unmarshal([]byte(byteValue), &result)

	// defer the closing of our jsonFile so that we can parse it later on
	return result
}

// Get Receipts
func GetReceipt(c *gin.Context) {
	fmt.Println("GET A RECEIPT ROUTE")

	id := c.Request.URL.Query()
	// id := c.Param("id")
	fmt.Println("URL PARAMS: ", id)
	// Eventually will look for receipt in db using id from URL param
	extractedData := extractReceipt()
	c.JSON(http.StatusOK, extractedData)

}

// Add Receipt to dbs
func saveReceipt(c *gin.Context) {

	// Initialize Postgres db
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  "user=stephenchow dbname=tabwise",
		PreferSimpleProtocol: true, // disables implicit prepared statement usage
	}), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	// data, _ := ioutil.ReadAll(c.Request.Body)
	// fmt.Println("DATA: ", data)
	// 1) Insert receipt in receipts table
	//		- Wait for receipt_id

	newReceipt := Receipt{
		User_Id:          1,
		Receipt_Price:    50,
		Num_People:       1,
		Transaction_Date: "2023-03-01",
		Category:         "Leisure",
		Receipt_PPP:      50,
		Vendor_Name:      "Taco Bell",
		Vendor_Address:   "12345 Street",
		Vendor_Phone:     "(234)324-2348",
		Vendor_URL:       "www.tacobell.com",
		Payment:          "MC***1234",
	}

	// Store new user's credentials in db (INSERT)
	addReceipt := db.Create(&newReceipt)

	// 2) Once we have receipt_id, insert all items
	//		- Each item gets it's own row
	//		- Either loop through items and add individually or see if we can bulk add multiple rows

	receipt_id := newReceipt.ID
	fmt.Println("RECEIPT ID: ", receipt_id)

	var AddReceiptErr = addReceipt.Error
	if AddReceiptErr != nil {
		fmt.Println("POSTGRES ERROR: ", AddReceiptErr)
	}

	items := []Item{
		{
			Receipt_ID:  receipt_id,
			Description: "Very good pizza",
			Item_Price:  240,
			Quantity:    1,
			Item_PPP:    240,
		},
	}

	numItems := len(items)
	addItems := db.CreateInBatches(&items, numItems)

	var AddItemsErr = addItems.Error
	if AddItemsErr != nil {
		fmt.Println("POSTGRES ERROR: ", AddItemsErr)
	}

	fmt.Println("LINE ITEMS ADDED: ", addItems)

}

// -------------------------- MAIN  --------------------------
func main() {
	router := gin.Default()

	router.Use(cors.Default())

	router.POST("/login", Login)
	router.POST("/signup", SignUp)
	router.POST("/image", ImageUpload)
	router.GET("/receipts", GetReceipts)
	router.POST("/receipts", saveReceipt)
	router.GET("/receipt/:id", GetReceipt)

	log.Fatal(router.Run(":8080"))
}
