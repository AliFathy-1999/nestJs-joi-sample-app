import { Expose } from "class-transformer";
import { JoiSchema, JoiSchemaOptions } from "joi-class-decorators";
import { ApiProperty } from "@nestjs/swagger";
import * as Joi from 'joi';
import { CategoryEnum } from "src/common/enum/category.enum";

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
    @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
    @Expose() @JoiSchema(Joi.string().trim().required())
    fullName: string;

    //Check on length, and is valid egyptian phone number
    @ApiProperty({ description: 'Egyptian phone number', example: '01012345678' })
    @Expose() @JoiSchema(Joi.string().length(11).pattern(/^(011|012|015|010)\d{8}$/).required())
    phoneNumber: string;

    //Check is valid email
    @ApiProperty({ description: 'Email address', required: false, example: 'john@example.com' })
    @Expose() @JoiSchema(Joi.string().email().optional())
    email?: string;

    //Check value is valid in case of M or F only
    @ApiProperty({ description: 'Gender', enum: ['M', 'F'], example: 'M' })
    @Expose() @JoiSchema(Joi.string().valid('M', 'F').required())
    gender: string;

    //militaryStatus is mendatory if gender is M otherwise is optional
    @ApiProperty({ description: 'Military status (required if gender is M)', required: false, example: 'Completed' })
    @Expose() @JoiSchema(
        Joi.when('gender', {
            is: 'M',
            then: Joi.string().required(),
            otherwise: Joi.string().optional(),
        }),
    )
    militaryStatus: string;

    //Check age is number, min 14 and max age is 100
    @ApiProperty({ description: 'Age between 14 and 100', example: 25 })
    @Expose() @JoiSchema(Joi.number().min(14).max(100).message('Invalid age'))
    age: number;

    //Check on Array of object with specific order
    @ApiProperty({ description: 'Array of reviews', type: [Object], example: [{ rating: 4.5, comment: 'Great product!' }] })
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
    @ApiProperty({ description: 'Profile picture URL', required: false, example: 'https://example.com/pic.jpg' })
    @Expose() @JoiSchema(Joi.string().allow('').optional())
    profilePicture?: string;

    //profileFileName is mendatory if profilePicture has an value otherwise it optional 
    @ApiProperty({ description: 'Profile file name (required if profilePicture is provided)', required: false, example: 'profile.jpg' })
    @Expose() @JoiSchema(
        Joi.when('profilePicture', {
            is: Joi.string().exist(),
            then:  Joi.string().required(),
            otherwise: Joi.string().allow('').optional(),
    }))
    profileFileName: string;

    //Check if isVerified is boolean and required
    @ApiProperty({ description: 'Verification status', example: true })
    @Expose() @JoiSchema(Joi.boolean().required())
    isVerified: boolean;

}

@JoiSchemaOptions({
    allowUnknown: false
})

export class validationParamDto {
    @ApiProperty({ description: 'Product category', enum: CategoryEnum, example: 'Electronics' })
    @Expose() @JoiSchema(Joi.string().valid(...Object.values(CategoryEnum)).required())
    category: string;
}

@JoiSchemaOptions({
    allowUnknown: false
})

export class validationQueryParamDto {

    @ApiProperty({ description: 'Limit for results (0-100)', example: 10 })
    @Expose() @JoiSchema(Joi.number().min(0).max(100).message('Invalid limit'))
    limit: string;

    @ApiProperty({ description: 'Page number (0-100)', example: 1 })
    @Expose() @JoiSchema(Joi.number().min(0).max(100).message('Invalid page size'))
    page: string;
}