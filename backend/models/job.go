package models

import (
	"go.mongodb.org/mongo-driver/v2/bson"
)

// id
// job title
// job description
// languages

type Job struct {
	ID          bson.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	CompanyName string        `json:"companyName" bson:"companyName"`
	Title       string        `json:"title" bson:"title"`
	Description string        `json:"description" bson:"description"`
	Languages   []string      `json:"languages" bson:"languages"`
}
