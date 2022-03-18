package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// -------------------------------- STRUCTS --------------------------------
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
