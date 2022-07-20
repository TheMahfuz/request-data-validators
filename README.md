
### Dependencies
Express.js
### Submited Data validation
You can use this validator by requiring the "request-validator" like below:
```javascript
let Request = require('./request-validator');
let request = new Request(req,res);

let data = {
    "value1": request.body(request,true,'Value 1').type('int').val(),
    "value2": request.body(request,true,'Value 2').type('int').allow([0,1]).val()
}
```
you have to call validate method to validate all data
```javascript
request.validate()
```
if success it return true if failure it redirect to back by defalut with old data erros in flash. YOu can retrive old data and error like below
```javascript
let errors = Req.flash('errors')[0],
let old = Req.flash('old')[0]
```
if you want to get the errors in json format then you have to provide false as parameter in validate method
```javascript
let errors = request.validate(false)
```
### Request validator methods:
| Methods | Parameters | Decription|
|---------|------------|-----------|
| get/params| key(string) | retrive the value url params |
| body/post | key(string), isRequired(bool), name(string), custom_message(string) | retrive value of url params |
| type | type(string) | validate the value type such as int, float,bool,number etc|
| length | length(int), custom_message(string) | validate the value is fixed length |
| minLength | length(int), custom_message(string)|validate minimum length of the value |
| maxLength | length(int), custom_message(string)|validate maximum length of the value |
| minNumber | value(int), custom_message(string)|validate minimum number of the value |
| maxNumber | value(int),custom_message(string)|validate maximum number of the value |
| disallow | values(array), custom_message(string) | validate if disallow value is provided |
| allow | values(array), custom_message(string) | validate the value is from allowed list |
| sameAs | key(string), custom_message(string) | check the value is same as others value |
| format | type(string="array_obj"), format(array of object),custom_message(string) | validate the provide array is correct format |
| val| N/A | finally return the value |
| validate| isRedirect(bool) | validate all required validation and return the result |

### Example of format array :
You have to pass this type of format array in calling the format method
```javascript
[{ "update_quantity": 'int', "inventory_item_id": "int" }]
```
### list of the value of type in type method:

| type | Decription |
|------|------------|
| int| Accept only integer type value |
| string | Accept only string type value |
| email | Accept only email type value |
| date | Accept only date type value |
| number | Accept only number type value |
| boolean | Accept only boolean type value |
| array_int | Accept only array int type value |
| mobile_bd | Accept only valid mobile number of bangladesh |