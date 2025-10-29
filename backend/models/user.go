package models

import "go.mongodb.org/mongo-driver/v2/bson"

type User struct {
	ID           bson.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Username     string        `json:"username" bson:"username"`
	Email        string        `json:"email" bson:"email"`
	Password     []byte        `json:"-" bson:"password"`
	ResumePath   string        `json:"resumePath,omitempty" bson:"resumePath,omitempty"`
	ParsedResume string        `json:"parsedResume,omitempty" bson:"parsedResume,omitempty"`
}
