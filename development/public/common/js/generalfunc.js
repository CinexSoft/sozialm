/**
 * WARNING:
 * Before making modifications to this file, make absolutely sure that
 * you've used the functions and their respective flags (if any) properly.
 * These functions work for almost every webpage, so there are more chances
 * you've used something incorrectly.
 *
 * When making modifications, you also need to test out if the modified code
 * works for each and every webpage.
 */

import { Auth } from '/common/js/firebaseinit.js';
import {
    DEBUG,
    EXISTS_ANDROID_INTERFACE,
} from '/common/js/variables.js';
import { log, err, } from '/common/js/logging.js';
import { Dialog } from '/common/js/overlays.js';

/**
 * Returns a local timestamp in ms since Unix epoch or in ns since app launch.
 * @param {Boolean} nanosec Optional, if true returns nanosecond time since app launch. If false, returns milliseconds time since Unix epoch.
 * @return {Number} Milliseconds time since Unix epoch.
 * @return {Number} Nanosecond time since app launch (conditional).
 */
export const getTimeStamp = (nanosec = false) => {
    if (!nanosec) return new Date().getTime();
    else return Math.floor(performance.now() * 1000);
}

/**
 * Gets current time zone, date time or return a date object.
 * @param {Boolean} Optional, if false returns a date object
 * @return {String} Current date in Continent/City/YYYY-MM-DD @ HH:MM:SS format.
 * @return {Object} Date object (conditional).
 */
export const getLongDateTime = (long_time = true) => {
    let date_ob = new Date();
    if (!long_time) return date_ob;
    let date = ('0' + date_ob.getDate()).slice(-2);
    let month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = ('0' + date_ob.getHours()).slice(-2);
    let minutes = ('0' + date_ob.getMinutes()).slice(-2);
    let seconds = ('0' + date_ob.getSeconds()).slice(-2);
    return `${Intl.DateTimeFormat().resolvedOptions().timeZone}/${year}-${month}-${date} @ ${hours}:${minutes}:${seconds}`;
}

/**
 * Creates a random `length` sized token.
 * @param {Number} length Optional, default value = 64. Size of token.
 * @return {String} The token of given size.
 */
export const generateToken = (length = 64) => {
    let array_of_chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
    let output_token = [];
    for (let i = 0; i < length; i++) {
        let j = (Math.random() * (array_of_chars.length - 1)).toFixed(0);
        output_token[i] = array_of_chars[j];
    }
    return output_token.join('');
}

/**
 * Replace certain special characters of a string with 'ASCII[character_code]'.
 * @param {String} str The string to be encoded.
 * @return {String} The encoded string.
 */
export const encode = (str) => {
    let specialChars = '\n\r!"#$%&\'./<=>@[\\]{}';
    for (let character of specialChars) {
        str = str.replaceAll(character, `ASCII${character.charCodeAt(0)}`);
    }
    return str;
}

/**
 * Decode string from 'ASCII[character_code]' format to something more readable.
 * @param {String} str The string to be decoded.
 * @return {String} The decoded string.
 */
export const decode = (str) => {
    let specialChars = '\n\r!"#$%&\'./<=>@[\\]{}';
    for (let character of specialChars) {
        str = str.replaceAll(`ASCII${character.charCodeAt(0)}`, character);
    }
    return str;
}

/**
 * Download a file using the Android WebAppInterface.
 * @param {String} directurl The direct URL to the file.
 * @param {String} filename Optional, but recommended otherwise the file extension is set to '.bin'.
 * @throws {Error} android interface doesn't exist.
 */
export const downloadFile = (directurl, filename = `sozialm_${getTimeStamp()}.bin`) => {
    if (EXISTS_ANDROID_INTERFACE) {
        try {
            Android.download(directurl, filename);
            log('[AND]: generalfunc.js: download(): through Android WepAppInterface');
        } catch (error) {
            err(`[AND]: generalfunc.js: download(): ${error}`);
            throw `Error: generalfunc.js: downloadFile(): ${error}`;
        }
        return;
    }
    let element = document.createElement('a');
    element.setAttribute('href', directurl);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

/**
 * Copy some text.
 * @param {String} str The string to be copied.
 */
export const copyPlainTxt = (copytext = '') => {
    copytext = copytext.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(copytext).then(() => {
        // do nothing
    }).catch((error) => {
        console.error(`generalfunc.js: copyPlainTxt(): ${error}`);
        if (EXISTS_ANDROID_INTERFACE) {
            Android.copyToClipboard(copytext);
            Android.showToast('Text copied!');
        } else {
            console.error('generalfunc.js: copyPlainTxt():  android interface doesn\'t exist');
            Dialog.display('alert', 'Oops!', 'Copy text to clipboard failed');
        }
    });
}

/**
 * Get the name of the current browser.
 * @return {String} Name of current browser.
 */
export const getBrowser = () => {
    if (/Opera|OPR/.test(navigator.userAgent)) return 'opera';
    if (navigator.userAgent.includes('Chrome')) return 'chrome';
    if (navigator.userAgent.includes('Safari')) return 'safari';
    if (navigator.userAgent.includes('Firefox')) return 'firefox';
    if (navigator.userAgent.indexOf('MSIE') != -1 || !!document.documentMode == true) return 'IE';
    return 'unknown';
}

/** 
 * Looks for updates to the android app and opens an alert dialog if update is available.
 */
export const checkForApkUpdates = () => {
    if (!EXISTS_ANDROID_INTERFACE) return;
    log('[AND]: generalfunc.js: checkForApkUpdates(): checking for update');
    try { 
        switch (Android.updateAvailable()) {
            case 'true':
                log('[AND]: generalfunc.js: checkForApkUpdates(): update available');
                Dialog.display('alert', 'Update available', 'A new version of this Android app is available.', 'Download', () => {
                   setTimeout(() => {
                        Android.showToast('Downloading app, look into your notification panel');
                        Android.download('https://sozialm.web.app/downloads/app.web.sozialm.apk', 'app.web.sozialm.apk');
                    }, 500);
                    Dialog.hide('alert');
                    log('[AND]: generalfunc.js: checkForApkUpdates(): downloaded Android app');
                });
                break;
            case 'failed':
                err('[AND]: generalfunc.js: checkForApkUpdates(): update check failed');
                break;
        }
    }
    catch (error) {
        err(`[AND]: generalfunc.js: checkForApkUpdates(): ${error}`);
    }
}

/**
 * Returns an object comprising of current URL query fields and their values.
 * @param {Array} fields The fields whose values you need. Pass [] for all fields.
 * @param {String} querystr Optional, the query string. Default is location.search.
 * @return {Object} The query fields and their values. Values will always be Strings. For duplicate fields, an array of values is returned.
 */
export const getURLQuery = (fields, querystr = location.search) => {
    const Parameters = {};
    for (let item of querystr.split(/\?|\&/)) if (item) {
        if (item.split(/=/).length != 2) throw `Error: generalfunc.js: getURLQuery(): malformed URL parameter '${item}'`;
        let param = item.split(/=/)[0];
        let value = item.split(/=/)[1];
        if (!param || !value) continue;
        if (fields.length != 0 && !fields.includes(param)) continue;
        if (!Parameters.hasOwnProperty(param)) Parameters[param] = value;
        else if (Array.isArray(Parameters[param])) Parameters[param].push(value);
        else Parameters[param] = [Parameters[param], value];
    }
    return Parameters;
}

/**
 * Returns the value of a given query field of the current URL.
 * @param {String} field The field whose value you need.
 * @param {String} querystr Optional, the query string. Default is location.search.
 * @return {String} The value of the field.
 * @return {Array} If the query has duplicate fields.
 */
export const getURLQueryFieldValue = (field, querystr = location.search) => {
    let values = [];
    for (let item of querystr.split(/\?|\&/)) if (item) {
        if (item.split(/=/).length != 2) throw `Error: generalfunc.js: getURLQueryFieldValue(): malformed URL parameter '${item}'`;
        let param = item.split(/=/)[0];
        let value = item.split(/=/)[1];
        if (param && value && field.toLowerCase() == param.toLowerCase()) values.push(value);
    }
    return values.length > 0 ? (values.length == 1 ? values[0] : values) : undefined;
}

/**
 * Alerts user of an error and also logs it.
 * @param {String} error The error to be reported. Can be HTML string.
 * @param {Object} error The error to be reported.
 */
export const displayErrorDialog = (error) => {
    Dialog.display('alert', 'Fatal error', (
          '<p style="'
        +     'margin: 2.5px;'
        +     'text-align: justify; ">'
        +     'Please copy the following error and report it to '
        +     '<a href="mailto:cinexsoft@gmail.com">'
        +         'cinexsoft@gmail.com'
        +     '</a>.'
        + '</p>'
        + '<pre style="'
        +     'margin: 3px 0;'
        +     'padding: 5px;'
        +     'padding-bottom: 3px;'
        +     'width: calc(100% - 10px);'
        +     'background-color:#efefef;'
        +     'border-radius: 5px;'
        +     'overflow: auto;'
        +     'text-align:left;'
        +     'font-size: 0.8rem;'
        +     'font-family: sans-serif; ">'
        +     '<code>'
        +         error // JSON.stringify({ error.name, error.message, error.stack, }, null, 4)
        +     '</code>'
        + '</pre>'
    ));
    throw `Error: generalfunc.js: displayErrorDialog(): ${error}`;
}

console.log('module generalfunc.js loaded');
