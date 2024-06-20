import { Expose } from "class-transformer";
import { JoiSchema, JoiSchemaOptions } from "joi-class-decorators";
import * as Joi from 'joi';

interface reviewInterface {
    rating: number;
    comment: string;
}
// @Expose ==> is used to mark properties that should be included in the transformation process, typically for serialization and deserialization. However.
// @JoiSchema() ==> Define a schema on a type (class) property. Properties with a schema annotation are used to construct a full object schema.


//It ensures strict validation by disallowing any properties that are not explicitly defined in your schema. 
@JoiSchemaOptions({
    allowUnknown: false
})

export class validationBodyDto {

    //Basic Validation is type string and required
    @Expose() @JoiSchema(Joi.string().trim().required())
    fullName: string;

    //Check on length, and is valid egyptian phone number
    @Expose() @JoiSchema(Joi.string().length(11).pattern(/^(011|012|015|010)\d{8}$/).required())
    phoneNumber: string;

    //Check is valid email
    @Expose() @JoiSchema(Joi.string().email().optional())
    email?: string;

    //Check value is valid in case of M or F only
    @Expose() @JoiSchema(Joi.string().valid('M', 'F').required())
    gender: string;

    //militaryStatus is mendatory if gender is M otherwise is optional
    @Expose() @JoiSchema(
        Joi.when('gender', {
            is: 'M',
            then: Joi.string().required(),
            otherwise: Joi.string().optional(),
        }),
    )
    militaryStatus: string;

    //Check age is number, min 14 and max age is 100
    @Expose() @JoiSchema(Joi.number().min(14).max(100).message('Invalid age'))
    age: number;

    //Check on Array of object with specific order
    @Expose()
    @JoiSchema(
        Joi.array().items(
                Joi.object({
                        rating: Joi.number().min(0.1).required(),
                        comment: Joi.string().min(3).max(300).required(),
                    }).required(),
            ).required(),
    )
    reviews: reviewInterface[];

    //allow this field with empty string
    @Expose() @JoiSchema(Joi.string().allow('').optional())
    profilePicture?: string;

    //profileFileName is mendatory if profilePicture has an value otherwise it optional 
    @Expose() @JoiSchema(
        Joi.when('profilePicture', {
            is: Joi.string().exist(),
            then:  Joi.string().required(),
            otherwise: Joi.string().allow('').optional(),
    }))
    profileFileName: string;

    //Check if isVerified is boolean and required
    @Expose() @JoiSchema(Joi.boolean().required())
    isVerified: boolean;

}

@JoiSchemaOptions({
    allowUnknown: false
})

export class validationParamDto {
    @Expose() @JoiSchema(Joi.string().valid('Fashions', 'Electronics', 'MobilesPhones', 'Perfumes').required())
    category: string;
}

@JoiSchemaOptions({
    allowUnknown: false
})

export class validationQueryParamDto {

    @Expose() @JoiSchema(Joi.number().min(0).max(100).message('Invalid limit'))
    limit: string;

    @Expose() @JoiSchema(Joi.number().min(0).max(100).message('Invalid page size'))
    page: string;
}