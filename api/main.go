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

// Receipt struct used by FoundReceipt to construct final json sent back to user
type Receipt struct {
	ID               int     `json:"receipt_id"`
	User_Id          int     `json:"user_id"`
	Receipt_Price    float64 `json:"receipt_price"`
	Num_People       int     `json:"num_people"`
	Transaction_Date string  `json:"transaction_date"`
	Category         string  `json:"category"`
	Receipt_PPP      float64 `json:"receipt_ppp"`
	Vendor_Name      string  `json:"vendor_name"`
	Vendor_Address   string  `json:"vendor_address"`
	Vendor_Phone     string  `json:"vendor_phone"`
	Vendor_URL       string  `json:"vendor_url"`
	Vendor_Logo      string  `json:"vendor_logo"`
	Payment          string  `json:"payment"`
}

type Receipts []Receipt

// Single Item
type Item struct {
	ID          int     `json:"item_id"`
	Receipt_ID  int     `json:"receipt_id"`
	Description string  `json:"description"`
	Item_Price  float64 `json:"item_price"`
	Quantity    float64 `json:"quantity"`
	Item_PPP    float64 `json:"item_ppp"`
}

// Arr of Item structs
type Items []Item

// struct when Adding Receipt
type AddReceipt struct {
	User_Id          int     `json:"user_id"`
	Receipt_Price    float64 `json:"receipt_price"`
	Num_People       int     `json:"num_people"`
	Transaction_Date string  `json:"transaction_date"`
	Category         string  `json:"category"`
	Receipt_PPP      float64 `json:"receipt_ppp"`
	Vendor_Name      string  `json:"vendor_name"`
	Vendor_Address   string  `json:"vendor_address"`
	Vendor_Phone     string  `json:"vendor_phone"`
	Vendor_URL       string  `json:"vendor_url"`
	Vendor_Logo      string  `json:"vendor_logo"`
	Payment          string  `json:"payment"`
	Line_Items       Items   `json:"line_items"`
}

// struct we return to user for GET "/receipt/{id}"
type FoundReceipt struct {
	Receipt
	Line_Items Items `json:"line_items"`
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

	// Query db for that username (unique)
	db.Where("username = ?", u.Username).First(&foundUser)
	// Compare hashed pw to pw provided by person
	// If hash is valid, issue JWT to user

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

// Get All Receipts for a user using /user_id url param
// Wasn't able to send/receive Authorization Header containing token
func GetReceipts(c *gin.Context) {
	var receipts Receipts

	fmt.Println("GET RECEIPTS ROUTE")

	user_id := c.Param("id")

	// Initialize Postgres db
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  "user=stephenchow dbname=tabwise",
		PreferSimpleProtocol: true, // disables implicit prepared statement usage
	}), &gorm.Config{})

	if err != nil {
		log.Fatal(err)
	}

	// Find receipt & line_items separately
	// Not using a JOIN because of how I'm using data in Frontend already
	// Frontend does not expect each item to have info about receipt
	db.Order("created_at desc").Find(&receipts, "user_id = ?", user_id)

	l, _ := json.MarshalIndent(receipts, "", "\t")
	fmt.Println("RECEIPTS: ", string(l))

	// Get Authorization: `Bearer Token` from header
	const BEARER_SCHEMA = "Bearer"
	authHeader := c.Request.Header["Authorization"]
	// tokenString := authHeader[len(BEARER_SCHEMA):]

	// type claims struct {
	// 	Id       uint64
	// 	Username string
	// 	Email    string
	// }

	// Parse the token
	// token, err := jwt.ParseWithClaims(tokenString, &claims{}, func(token *jwt.Token) (interface{}, error) {
	// 	// since we only use the one private key to sign the tokens,
	// 	// we also only use its public counter part to verify
	// 	return verifyKey, nil
	// })

	// claims := jwt.MapClaims{}
	// token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
	// 	return []byte("<YOUR VERIFICATION KEY>"), nil
	// })

	// token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
	// 	if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
	// 		return nil, errors.New("unexpected signing method")
	// 	}
	// 	return []byte(os.Getenv("ACCESS_SECRET")), nil
	// })

	// if err != nil {
	// 	fmt.Println(err)
	// }

	fmt.Println("TOKEN: ", authHeader)
	// Implement similar logic to getting a single receipt
	// Use user_id to get receipts for only that user

	c.JSON(http.StatusOK, receipts)
}

// Get Receipt by receipt_id
func GetReceipt(c *gin.Context) {
	var receipt Receipt
	var items Items

	fmt.Println("GET A RECEIPT ROUTE")

	receipt_id := c.Param("id")
	fmt.Println("URL PARAMS: ", receipt_id)

	// Initialize Postgres db
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  "user=stephenchow dbname=tabwise",
		PreferSimpleProtocol: true, // disables implicit prepared statement usage
	}), &gorm.Config{})

	if err != nil {
		log.Fatal(err)
	}

	// Find receipt & line_items separately
	// Not using a JOIN because of how I'm using data in Frontend already
	// Frontend does not expect each item to have info about receipt
	db.Find(&receipt, receipt_id)
	db.Find(&items, "receipt_id = ?", receipt_id)

	// Construct json object to send back to frontend
	foundReceipt := &FoundReceipt{}
	foundReceipt.Receipt = receipt
	foundReceipt.Line_Items = items

	l, _ := json.MarshalIndent(foundReceipt, "", "\t")
	fmt.Print("ITEMS: ", string(l))

	c.JSON(http.StatusOK, foundReceipt)
}

// DELETE Receipt by receipt_id
func RemoveReceipt(c *gin.Context) {

	fmt.Println("Delete A RECEIPT ROUTE")

	receipt_id := c.Param("id")
	fmt.Println("URL PARAMS: ", receipt_id)

	// Initialize Postgres db
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  "user=stephenchow dbname=tabwise",
		PreferSimpleProtocol: true, // disables implicit prepared statement usage
	}), &gorm.Config{})

	if err != nil {
		log.Fatal(err)
	}

	// Delete Receipt by id
	db.Delete(&Receipt{}, receipt_id)

	// extractedData := extractReceipt()
	c.JSON(200, gin.H{"message": "Successfully deleted receipt"})
}

// Add Receipt to dbs
func saveReceipt(c *gin.Context) {
	var incomingReceipt AddReceipt // u is json we receive from POST request

	if err := c.BindJSON(&incomingReceipt); err != nil {
		print("ERROR: ", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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

	// 1) Insert receipt in receipts table
	//		- Wait for receipt_id

	newReceipt := Receipt{
		User_Id:          incomingReceipt.User_Id,
		Receipt_Price:    incomingReceipt.Receipt_Price,
		Num_People:       incomingReceipt.Num_People,
		Transaction_Date: incomingReceipt.Transaction_Date,
		Category:         incomingReceipt.Category,
		Receipt_PPP:      incomingReceipt.Receipt_PPP,
		Vendor_Name:      incomingReceipt.Vendor_Name,
		Vendor_Address:   incomingReceipt.Vendor_Address,
		Vendor_Phone:     incomingReceipt.Vendor_Phone,
		Vendor_URL:       incomingReceipt.Vendor_URL,
		Vendor_Logo:      incomingReceipt.Vendor_Logo,
		Payment:          incomingReceipt.Payment,
	}

	// Create new receipt in dB
	addReceipt := db.Create(&newReceipt)

	// 2) Once we have receipt_id, insert all items
	receipt_id := newReceipt.ID

	var AddReceiptErr = addReceipt.Error
	if AddReceiptErr != nil {
		fmt.Println("POSTGRES ERROR: ", AddReceiptErr)
	}

	fmt.Println("Receipt added to dB")

	// Save AddReceipt.LineItems to Items struct
	items := incomingReceipt.Line_Items

	numItems := len(items)

	// Change receipt_id for all items
	for i := 0; i < numItems; i++ {
		r_id := &items[i]
		r_id.Receipt_ID = receipt_id
	}

	addItems := db.CreateInBatches(&items, numItems)

	var AddItemsErr = addItems.Error
	if AddItemsErr != nil {
		fmt.Println("POSTGRES ERROR: ", AddItemsErr)
	}

	fmt.Println("Items added to dB")

	c.JSON(200, gin.H{"receipt_id": receipt_id, "message": "Successfully saved receipt"})

}

// -------------------------- MAIN  --------------------------
func main() {
	router := gin.Default()

	// Had to enable Authorization header in CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "DELETE", "PUT", "PATCH"},
		AllowHeaders:     []string{"Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	router.POST("/login", Login)
	router.POST("/signup", SignUp)
	router.POST("/image", ImageUpload)
	router.GET("/receipts/:id", GetReceipts)
	router.POST("/receipts", saveReceipt)
	router.GET("/receipt/:id", GetReceipt)
	router.DELETE("/receipt/:id", RemoveReceipt)

	log.Fatal(router.Run(":8080"))
}
