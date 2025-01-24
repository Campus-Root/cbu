// console.log(response);
        

// let response_message = response.choices[0].message
// let tool_calls = response_message.tool_calls
// let function_response
// if (tool_calls) {
//     available_functions = { "requestMoreInformation": requestMoreInformation }
//     for (const tool_call of tool_calls) {
//         console.log(`Function: ${tool_call.function.name}`);
//         console.log(`Params: ${tool_call.function.arguments}`);
//         const function_name = tool_call.function.name;
//         const function_to_call = available_functions[function_name];
//         if (function_to_call) {
//             const function_args = JSON.parse(tool_call.function.arguments || "{}");
//             function_response = function_to_call(function_args);
//             console.log(`API Response: ${function_response}`);
//         } else {
//             console.log(`Function "${function_name}" is not available.`);
//         }
//     }
// }


        // let tools = [
        //     {
        //         "type": "function",
        //         "function": {
        //             "name": "requestMoreInformation",
        //             "description": "call this function when info given is not sufficient to complete the query",
        //             "parameters": {}
        //         },
        //     }
        // ]


        // export const requestMoreInformation = () => {
        //     try {
        //         // fetch("https://admissions.cbu.edu/register/request-more-info?cmd=submit&output=xdm&embedElement=form_8265703c-5e4d-4308-8155-7f50fb7e624f", {
        //         //     "headers": {
        //         //       "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        //         //       "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        //         //       "cache-control": "max-age=0",
        //         //       "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryKqVI9D6VApDReEs0",
        //         //       "priority": "u=0, i",
        //         //       "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        //         //       "sec-ch-ua-mobile": "?0",
        //         //       "sec-ch-ua-platform": "\"macOS\"",
        //         //       "sec-fetch-dest": "iframe",
        //         //       "sec-fetch-mode": "navigate",
        //         //       "sec-fetch-site": "same-origin",
        //         //       "sec-fetch-user": "?1",
        //         //       "upgrade-insecure-requests": "1",
        //         //       "cookie": "_node=0884b6b69328a2f83a877fac94eb03198b4762757c0dcd5c7c1d88badc29cb79; _hash=70f7cb98-036c-4a6c-a642-77e9f8517db0; _hashV=202501/1; _gcl_au=1.1.2085164734.1737627072; _gid=GA1.2.651816751.1737627072; _ga=GA1.1.1379086263.1737627072; _fbp=fb.1.1737627072362.409452320920632447; _ga_13HCL8WV50=GS1.1.1737627072.1.1.1737627822.5.0.0",
        //         //       "Referer": "https://admissions.cbu.edu/register/request-more-info",
        //         //       "Referrer-Policy": "origin-when-cross-origin"
        //         //     },
        //         //       "body": "------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"id\"\r\n\r\n8265703c-5e4d-4308-8155-7f50fb7e624f\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"sk\"\r\n\r\n1QuiXSdfR_w_-lCmM3OmAIrVNida9CTG9Q4qMH_famFDVbzav7byyq6WfqHZW-JwiPg6W0RCdAwoR3tCImnUq2T_CEODSLMCNb1IfDKWMINXtA-oXErcOWJ4pzyQSgnJhX_w_d_IkeuGfV213nUItclVgJ5rpJ74XH4-99e5rW0nYOqOnwxmyiDccLeCXoPDXmmcCGV5K_ePAppYUGSg24q5E1gGwA8hI8GKNCPHU1fdPg7R0VXt8ptSqQSpTSCKFXP2VLzUyzbsaGkpYKB5vw12p4YjvegT7tgqHhCVx-mi3-vglydi0N2iVt_44KmETyPUSjwU8vssGG3AQCyc4TGMNX4qXd8vZyvNAv4Q9B2C5hGQIWJ44xK2FOojIhrkGI2-vhs4K3E\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"referrer\"\r\n\r\nhttps://www.cbu.edu/\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_ab4d21fb-67dc-4b35-a52c-fc5798d2798f\"\r\n\r\ntestFname\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_191f5a5d-eb2c-4b68-b49d-3a23313f6e29\"\r\n\r\ntestPrefName\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_7db570b7-44e8-40c8-90dc-8bb0d8ab7a9a\"\r\n\r\ntestMiddleName\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_d28d984b-a3f2-4c62-af7c-37bf0aa999c2\"\r\n\r\ntestLastName\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_b04c40f4-8518-4d6d-9ea8-1100f50e8c65_m\"\r\n\r\n05\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_b04c40f4-8518-4d6d-9ea8-1100f50e8c65_d\"\r\n\r\n05\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_b04c40f4-8518-4d6d-9ea8-1100f50e8c65_y\"\r\n\r\n1997\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_26ac504a-5ce8-4e9b-98b2-7b1b4b626b2e_country\"\r\n\r\nUS\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_26ac504a-5ce8-4e9b-98b2-7b1b4b626b2e_street\"\r\n\r\n4829 Locust View Drive\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_26ac504a-5ce8-4e9b-98b2-7b1b4b626b2e_city\"\r\n\r\nOakland\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_26ac504a-5ce8-4e9b-98b2-7b1b4b626b2e_region\"\r\n\r\nCA\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_26ac504a-5ce8-4e9b-98b2-7b1b4b626b2e_postal\"\r\n\r\n94612\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_26ac504a-5ce8-4e9b-98b2-7b1b4b626b2e_quality\"\r\n\r\n\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_26ac504a-5ce8-4e9b-98b2-7b1b4b626b2e_dirty\"\r\n\r\n0\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_97204c3b-81b2-4994-b715-52c84839e687\"\r\n\r\ncherry@gmail.com\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_62686234-59bc-4432-a739-356e18558152\"\r\n\r\n+1 415-915-7090\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_12cd4320-2c0d-44ec-919c-b6b4ec3d9669\"\r\n\r\n1\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_551f0943-5936-43bf-bfd2-b412856ce74f\"\r\n\r\n51c381d7-331f-4af4-a0a0-ca7ca013e264\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_2018f53e-8604-4987-8d87-523dc6330347\"\r\n\r\nbc83f234-75fe-4a4a-9cd1-c81a5186c090\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_227bba44-8682-424c-abaf-751857621f25\"\r\n\r\n1567a8eb-d788-4467-9a3b-8b935f06cd3b\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_04ccee8d-c8fd-4d3f-8c23-bcfdbb93a753\"\r\n\r\n35c3a7c9-1524-4df4-9eae-102504fe13ae\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_1d2831aa-bfb8-49a6-a6f3-0b544e81e247\"\r\n\r\nCommunity College of Allegheny County - North Campus\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_e46de6ea-bd25-457f-b912-8a6bec5392c5\"\r\n\r\n2025\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"form_463c98a6-4948-480c-b630-65ad3e0b9914\"\r\n\r\n1f617db8-c865-4186-949e-8d46b1493166\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0\r\nContent-Disposition: form-data; name=\"cmd\"\r\n\r\nsubmit\r\n------WebKitFormBoundaryKqVI9D6VApDReEs0--\r\n",
        //         //     "method": "POST"
        //         //   });
        
        //         return {
        //             "endpoint": "https://admissions.cbu.edu/register/request-more-info",
        //             "method": "POST",
        //             "description": "Submits a form to request more information via a POST request.",
        //             "headers": {
        //                 "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        //                 "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        //                 "cache-control": "max-age=0",
        //                 "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryKqVI9D6VApDReEs0",
        //                 "priority": "u=0, i",
        //                 "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        //                 "sec-ch-ua-mobile": "?0",
        //                 "sec-ch-ua-platform": "\"macOS\"",
        //                 "sec-fetch-dest": "iframe",
        //                 "sec-fetch-mode": "navigate",
        //                 "sec-fetch-site": "same-origin",
        //                 "sec-fetch-user": "?1",
        //                 "upgrade-insecure-requests": "1",
        //                 "cookie": "_node=0884b6b69328a2f83a877fac94eb03198b4762757c0dcd5c7c1d88badc29cb79; _hash=70f7cb98-036c-4a6c-a642-77e9f8517db0; _hashV=202501/1; _gcl_au=1.1.2085164734.1737627072; _gid=GA1.2.651816751.1737627072; _ga=GA1.1.1379086263.1737627072; _fbp=fb.1.1737627072362.409452320920632447; _ga_13HCL8WV50=GS1.1.1737627072.1.1.1737627822.5.0.0",
        //                 "Referer": "https://admissions.cbu.edu/register/request-more-info",
        //                 "Referrer-Policy": "origin-when-cross-origin"
        //             },
        //             "body": {
        //                 "id": "8265703c-5e4d-4308-8155-7f50fb7e624f",
        //                 "sk": "1QuiXSdfR_w_-lCmM3OmAIrVNida9CTG9Q4qMH_famFDVbzav7byyq6WfqHZW-JwiPg6W0RCdAwoR3tCImnUq2T_CEODSLMCNb1IfDKWMINXtA-oXErcOWJ4pzyQSgnJhX_w_d_IkeuGfV213nUItclVgJ5rpJ74XH4-99e5rW0nYOqOnwxmyiDccLeCXoPDXmmcCGV5K_ePAppYUGSg24q5E1gGwA8hI8GKNCPHU1fdPg7R0VXt8ptSqQSpTSCKFXP2VLzUyzbsaGkpYKB5vw12p4YjvegT7tgqHhCVx-mi3-vglydi0N2iVt_44KmETyPUSjwU8vssGG3AQCyc4TGMNX4qXd8vZyvNAv4Q9B2C5hGQIWJ44xK2FOojIhrkGI2-vhs4K3E",
        //                 "referrer": "https://www.cbu.edu/",
        //                 "formData": {
        //                     "firstName": "",
        //                     "preferredName": "",
        //                     "middleName": "",
        //                     "lastName": "",
        //                     "birthMonth": "",
        //                     "birthDay": "",
        //                     "birthYear": "",
        //                     "address": {
        //                         "country": "",
        //                         "street": "",
        //                         "city": "",
        //                         "region": "",
        //                         "postal": ""
        //                     },
        //                     "email": "",
        //                     "phone": "",
        //                     "contactPreference": "",
        //                     "additionalData": {
        //                         "school": "",
        //                         "graduationYear": ""
        //                     }
        //                 },
        //                 "cmd": ""
        //             }
        //         }
        
        //     } catch (error) {
        //         console.log(error);
        //     }
        // }