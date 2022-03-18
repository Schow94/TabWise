package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// ------------------------------ STRUCTS ------------------------------
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

// struct we return to user for GET "/receipt/{id}"
type FoundReceipt struct {
	Receipt
	Line_Items Items `json:"line_items"`
}

type Receipts []Receipt

// ------------------------------ RECEIPT METHODS ------------------------------
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

// Get All Receipts for a user using /user_id url param
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
	c.JSON(http.StatusOK, receipts)
}

// DELETE Receipt by receipt_id
func RemoveReceipt(c *gin.Context) {

	fmt.Println("DELETE RECEIPT ROUTE")

	receipt_id := c.Param("id")

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

	c.JSON(200, gin.H{"message": "Successfully deleted receipt"})
}

// Add Receipt to dbs
func saveReceipt(c *gin.Context) {
	var incomingReceipt AddReceipt

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
