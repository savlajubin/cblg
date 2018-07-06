module.exports.constant = {
    'BASEURL': 'http://jubin.localtunnel.me',
    'SUPPORTMAIL': 'testrth1@gmail.com',
    'MAILSERVICE': {
        'NAME': 'Gmail',
        'USER': 'testrth1@gmail.com',
        'PASSWORD': 'password',
    },
    'USER_AUDIO': '',
    'TWILIO_CREDENTILAS': {
        'accountSid': 'AC9518e4d7985e80cb80555cdb55047691', //smartData Test
        'authToken': '9d24efad2692915f9db60de65ad67e60', //smartData Test

        //'accountSid': 'ACfdae27f48102a567dd8040b7d803cdfe', //smartData Live
        //'authToken': '336d891e797c29ab1eade8a5c9ca0e62', //smartData Live

        //'accountSid': 'AC30ea915f45a5b377afe709dba1b9ad49', //Jason Live
        //'authToken': '570a49181b435d09806dc91e8245b539', //Jason Live
        //'API_BASE_URL': 'https://52.27.242.122:3000',
        'API_BASE_URL': 'https://jubin.localtunnel.me/',
    },
    'SEND_GRID':{
        'username':'benne2jp',
        'password':'Uiojkl00'
    },
    'AMAZON_AWS':{
        'key':'AKIAJSW5M4ZJAOGOYMYA',
        'secret':'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'
    },
    'MESSAGES': {
       'registerSuccess': 'Registered',
       'alreadyExist': 'Already Exist',
       'verticalAlreadyExist': 'Category exist for this.Please delete corresponding category first.',
       'categoryAlreadyExist': 'Offer template exist for this.Please delete corresponding Offer template first.',
       'updateSuccess': 'Updated',
       'saveSuccess': 'Saved',
       'Error': 'Error',
       'Success': 'Success',
       'assignIVR': 'Assigned Successfully',
       'removedIVR': 'Removed',
       'statusSuccess': 'Status changed',
       'paymentSuccess': 'Payment done',
       'paymentPending': 'Payment In-Process',
       'deleteSuccess': 'Deleted',
       'requestSuccess': 'Request Sent',
       'alreadyRequested': 'Already Requested',
       'notFound': 'Not Found',
       'uploadSuccess': 'Uploaded',
       'valid': 'Valid',
       'invalid': 'Invalid',
       'passwordReset': 'Password reset link has been sent to your email.Please check your email for instructions',
       'domainAlreadyExist': 'Domain Already Exist',
       'unAuthorizeAccess': 'Unauthorize Access'
    },
    'CODES': {
       'OK': 200,
       'NoContent': 204,
       'BadRequest': 400,
       'Unauthorized': 401,
       'PR': 402,
       'Forbidden': 403,
       'notFound': 404,
       'Error': 500,
    },
    'ROLE_CODES': {
       'LGN': '559a6a1723405677c3d2d436',
       'LG': '559a6a2023405677c3d2d437',
       'ADVCC': '55de08dacbb875f85be7ddf3',
       'LB': '559a6a3423405677c3d2d439',
       'PA': '559a6a2a23405677c3d2d438',
    },
    'RESTFUL_API':{
        'SecretKey': 'CallBasedLeadGenerationRestFulApi'
    }

}
