/*
 @Purpose:to get requested data from url query string,url parameter or post body with some basic validation
 @use: require this request in every controller then use this methods
*/

/*

 allow types = number,int,boolean,string,float
 number = float : any number value (allow +-)
 boolean = bool : true/false
 int = integer : any number without point allow +-

*/

const { isValidDataType, utils } = require('./utils');

module.exports = class RequestData {
    constructor(req, res) {
        this.typeOfValue = 'string';
        this.isRequired = false;
        this.errors = {
            'length': 0,
            'code': 'INVALID_REQUEST_DATA',
            'details': {}
        }
        this.value = '';
        this.Request = req;
        this.Response = res;

    }

    /**
     * 
     * @param String key 
     * @returns string
     */
    get(key) {
        return this.Request.query[key];
    }

    /**
     * 
     * @param String key 
     * @returns string
     */
    params(key) {
        return this.Request.params[key];
    }

    /**
     * 
     * @param String key 
     * @param boolean isRequired 
     * @param string name 
     * @param string custom_message 
     * @returns instance
     */
    post(key, isRequired = false, name = '', custom_message = '') {
        this.isRequired = isRequired;
        this.key = key;
        this.value = this.Request.body[key];
        this.typeOfValue = typeof this.Request.body[key];

        if (this.Request.body[key] !== 0 && this.Request.body[key] != false) {
            if ((!this.Request.body[key] && isRequired == true)) {
                if (typeof this.errors.details[key] == 'undefined') {
                    this.errors.length = this.errors.length + 1;
                    this.errors.details[key] = (custom_message != '') ? custom_message : ((name.length > 0) ? name : key) + ' Field is required'
                }
                return this;
            }
        }

        if (typeof this.value == 'string') {
            this.value = this.value.trim();
        }
        return this;
    }
    /**
     * 
     * @param String key 
     * @param boolean isRequired 
     * @param string name 
     * @param string custom_message 
     * @returns instance
     */
    body(key, isRequired = false, name = '', custom_message = '') {
        return this.post(key, isRequired, name, custom_message);
    }

    /**
     * 
     * @param String type 
     * @param string custom_message 
     * @returns instance
     */
    type(type, custom_message = '') {
        let is_valid = true;

        type = type.toLowerCase();

        if (type == 'int') type = 'integer';
        else if (type == 'bool') type = 'boolean';
        else if (type == 'float') type = 'number';

        if (this.value || this.value === 0) {
            is_valid = isValidDataType(this.value, type)
        }
        if (!is_valid) {
            if (typeof this.errors.details[this.key] == 'undefined') {
                let type_name = type;
                this.errors.length = this.errors.length + 1;
                if (type == 'array_int') type_name = 'array of int';
                else if (type == 'date') type_name = 'date format YYYY-MM-DD';
                else if (type == 'mobile_bd') type_name = '11 digit valid mobile number';
                this.errors.details[this.key] = (custom_message != '') ? custom_message : 'Data should be ' + type_name
            }
        }
        return this;
    }

    /**
     * 
     * @param int length 
     * @param string custom_message 
     * @returns instance
     */

    length(length, custom_message = '') {
        if ((this.typeOfValue == 'string' && this.value.length != length)) {
            if (typeof this.errors.details[this.key] == 'undefined') {
                this.errors.length = this.errors.length + 1;
                this.errors.details[this.key] = (custom_message != '') ? custom_message : 'Value should be ' + length + ' characters.'
            }
        }
        return this;
    }

    /**
     * 
     * @param int min length 
     * @param string custom_message 
     * @returns instance
     */
    minLength(length, custom_message = '') {
        if ((this.typeOfValue == 'string' && this.value.length < length)) {
            if (typeof this.errors.details[this.key] == 'undefined') {
                this.errors.length = this.errors.length + 1;
                this.errors.details[this.key] = (custom_message != '') ? custom_message : 'Value should be minimum ' + length
            }

        }
        return this;
    }

    /**
     * 
     * @param int max length 
     * @param string custom_message 
     * @returns instance
     */
    maxLength(value, message = '') {

        if ((this.typeOfValue == 'string' && this.value.length > value)) {
            if (typeof this.errors.details[this.key] == 'undefined') {
                this.errors.length = this.errors.length + 1;
                this.errors.details[this.key] = (message != '') ? message : 'Length of the value should be maximum ' + value
            }
        }
        return this;
    }

    /**
     * 
     * @param int max value 
     * @param string custom_message 
     * @returns instance
     */
    maxNumber(value, message = '') {
        if ((utils.isNumber(this.value) && this.value > value)) {
            if (typeof this.errors.details[this.key] == 'undefined') {
                this.errors.length = this.errors.length + 1;
                this.errors.details[this.key] = (message != '') ? message : 'Maximum value should be ' + value;
            }
        }
        return this;
    }

    /**
     * 
     * @param int min value 
     * @param string custom_message 
     * @returns instance
     */
    minNumber(value, message = '') {
        if ((utils.isNumber(this.value) && this.value < value)) {
            if (typeof this.errors.details[this.key] == 'undefined') {
                this.errors.length = this.errors.length + 1;
                this.errors.details[this.key] = (message != '') ? message : 'Maximum value should be ' + value;
            }
        }
        return this;
    }

    /**
     * 
     * @param function callback 
     * @param string custom_message 
     * @returns instance
     */
    custom(callback, message = '') {
        if (callback.toString().includes('async')) {
            throw ('custom function should not be asynchronous')
        }
        let res = callback();
        if (!res) {
            if (typeof this.errors.details[this.key] == 'undefined') {
                this.errors.length = this.errors.length + 1;
                this.errors.details[this.key] = (message != '') ? message : 'Data should be valid';
            }
        }
        return this;
    }

    /**
     * 
     * @param array disalled values 
     * @param string custom_message 
     * @returns instance
     */
    disallow(values, message = '') {
        if (this.value || this.value === 0) {
            let match = false;
            for (let value in values) {
                if (this.value == values[value]) {
                    match = true;
                    break;
                }
            }
            if (match == true) {
                if (typeof this.errors.details[this.key] == 'undefined') {
                    this.errors.length = this.errors.length + 1;
                    this.errors.details[this.key] = (message != '') ? message : this.value + ' is not allowed';
                }
            }
        }

        return this;
    }

    /**
     * 
     * @param array allwed values 
     * @param string custom_message 
     * @returns instance
     */
    allow(values, message = '') {
        if ((this.value || this.value === 0)) {
            let match = false;
            for (let value in values) {
                if (this.value == values[value]) {
                    match = true;
                    break;
                }
            }
            if (!match) {
                if (typeof this.errors.details[this.key] == 'undefined') {
                    this.errors.length = this.errors.length + 1;
                    this.errors.details[this.key] = (message != '') ? message : this.value + ' is not allowed';
                }
            }
        }
        return this;
    }

    /**
     * 
     * @param string key of body
     * @param string custom_message 
     * @returns instance
     */
    sameAs(key, message = '') {
        let _name = key.charAt(0).toUpperCase() + key.slice(1)
        let name = _name.replace('_', ' ');
        if (this.Request.body[key] !== 0) {
            if ((!this.Request.body[key])) {
                if (typeof this.errors.details[key] == 'undefined') {
                    this.errors.length = this.errors.length + 1;
                    this.errors.details[key] = (message != '') ? message : ((name.length > 0) ? name : key) + ' Field is required'
                }
                return this;
            }
        }

        if (this.value !== this.Request.body[key]) {
            this.errors.length = this.errors.length + 1;
            this.errors.details[this.key] = (message != '') ? message : "Confirm Password didn't match";
        }
        return this;
    }
    /**
     * @purpose matching array of object format with request data
     * @param string type="array_obj" 
     * @param string custom_message 
     * @returns instance
     */
    format(type, format, custom_message = "") {
        let is_valid = true;
        if (type == 'array_obj') {
            try {
                this.value = (!Array.isArray(this.value)) ? JSON.parse(this.value) : this.value;
                if (Array.isArray(this.value)) {
                    this.value.every(value => {
                        for (let k in format[0]) {
                            is_valid = isValidDataType(value[k], format[0][k])
                            if (!is_valid) return false;
                        }
                    })
                } else is_valid = false;
            } catch (e) {
                console.log(e)
                is_valid = false;
            }
        }
        if (!is_valid) {
            if (typeof this.errors.details[this.key] == 'undefined') {
                this.errors.length = this.errors.length + 1;
                this.errors.details[this.key] = (custom_message != '') ? custom_message : 'Data format should be ' + JSON.stringify(format)
            }
        }
        return this;
    }

    /**
     * @pupose get the value form request
     * @returns any value
     */
    val() {
        let val = this.value;
        this.value = '';
        this.key = '';
        this.typeOfValue = '';
        this.isRequired = false;
        return val;
    }

    /**
     * Validate request data
     * @returns {boolean}
     */
    isValidate(auto_response = false) {
        let vs = { ...this.errors };
        let resp = {
            result_code: 1,
            time: new Date().valueOf(),
            error: {}
        };
        if (vs.length > 0) {
            if (this.Request.xhr || this.Request.originalUrl.includes('api')) {
                resp.error.title = 'Invalid Request Data';
                let message = '';
                let count = 1;
                for (let key in vs.details) {
                    if (count == 1) message += key;
                    else message += ", " + key;
                    count++;
                }
                resp.error.message = message + " " + ((count == 2) ? "is" : 'are') + ' invalid';
                resp.error.details = vs.details;
                if (auto_response) {
                    this.Response.status(400).send(resp);
                    if (this.logger) {
                        try {
                            this.logger.log({
                                level: 'error', label: vs.error_code, data: resp.error, request_id: this.Request.request_id
                            })
                        } catch (err) {
                            console.log(err)
                        }
                    }
                    return false;
                }
                else return resp.error;
            } else {
                this.Request.flash('errors', this.errors.details);
                this.Request.flash('old', this.Request.body);
                if (auto_response) {
                    this.Response.redirect(this.Request.header('Referer') || '/');
                    return false;
                }
                else return false;
            }
        } else {
            return true;
        }
    }
    /**
     * Validate request data
     * @returns {boolean}
    */
    validate(auto_response = false) {
        return this.isValidate(auto_response)
    }
}
