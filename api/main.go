package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// Load env contents
func init() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
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

	// ------------------ AUTH ROUTES ------------------
	router.POST("/login", Login)
	router.POST("/signup", SignUp)

	// ------------------ IMAGE UPLOAD ROUTES ------------------
	router.POST("/image", ImageUpload)

	// ------------------ RECEIPT ROUTES ------------------
	router.GET("/receipts/:id", GetReceipts)
	router.POST("/receipts", saveReceipt)
	router.GET("/receipt/:id", GetReceipt)
	router.DELETE("/receipt/:id", RemoveReceipt)

	log.Fatal(router.Run(":8080"))
}
