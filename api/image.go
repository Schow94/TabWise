package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

type Image struct {
	FileData *multipart.FileHeader `form:"file"`
}

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
