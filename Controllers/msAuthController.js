import msal from '@azure/msal-node';
import request from 'request';
const REDIRECT_URI = `${process.env.BACKENDURL}/auth/microsoft/callback/redirect`;
// const REDIRECT_URI = "http://localhost:3000/testlogin";
const clientID = process.env.MICROSOFT_GRAPH_CLIENT_ID;
const tenantID = process.env.MICROSOFT_GRAPH_TENANT_ID;
const clientSecret = process.env.MICROSOFT_GRAPH_CLIENT_SECRET;

import express from 'express';
// const msal = require('@azure/msal-node');

const config = {
  auth: {
    clientId: clientID,
    authority: "https://login.microsoftonline.com/"+tenantID,
    clientSecret: clientSecret,
    redirectUri: `${process.env.FRONTENDURL}/studentallproject`,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message) {
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    },
  },
};

const pca = new msal.PublicClientApplication(config);

const app = express();

export const login = async (req, res) => {
  const authCodeUrlParameters = {
    scopes: ['user.read'],
    redirectUri: `${process.env.FRONTENDURL}/studentallproject`,
  };

  const authUrl = await pca.getAuthCodeUrl(authCodeUrlParameters);

  res.redirect(authUrl);
};




export const getToken = async (req,res) => {
  console.log("1")
  const url = `https://login.microsoftonline.com/${tenantID}/oauth2/token`;
  const formData = new URLSearchParams();

  // const newurl=`https://login.microsoftonline.com/{850aa78d-94e1-4bc6-9cf3-8c11b530701c}/oauth2/authorize?client_id=9ea87694-877c-4d59-b65e-c4a3fd12799c&response_type=code&redirect_uri=http://localhost:3000/studentallproject&response_mode=query&state=12345`
  // const resp = await fetch(newurl);
  // const json=resp.json;
  // console.log(json);
  // console.log("resp",json);
  console.log("req",req.headers.code)
  
  formData.append('client_id', clientID);
  formData.append('client_secret', clientSecret);
  formData.append('scope', "openid profile email");
  formData.append('redirect_uri', `${process.env.FRONTENDURL}/studentallproject`);
  formData.append('grant_type', 'authorization_code');
  formData.append('code', req.headers.code);
  formData.append('resource', "https://graph.microsoft.com");

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });
  

  console.log("2")

  if (response.ok) {
    console.log("iiii")
    const data = await response.json();
    console.log(data)
    const accessToken=data.access_token;
    const id=data.clientID;
    console.log(id)
    
    const url2 = 'https://graph.microsoft.com/v1.0/me';

    const response2 = await fetch(url2, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("new reponse",response2)
    if (response2.ok) {
      const data = await response2.json();
      console.log("final step")
      console.log("data",data)

      res.status(200).json({ studInformation: data });
    } else {
      console.log("jjjj")
      throw new Error(await response2.text());
    }
    } 
    else {
      throw new Error(await response.text());
    }
  };








// export{getToken}


// exports.microsoftLogin = (req,res) => {
//   const authCodeUrlParameters = {
//       scopes: ["user.read"],
//       redirectUri: REDIRECT_URI,
//   };

//   // get url to sign user in and consent to scopes needed for application
//   pca.getAuthCodeUrl(authCodeUrlParameters).then((response) => {
//     console.log(response);
//       res.redirect(response);
//   }).catch((error) => console.log(JSON.stringify(error)));
// };

// exports.microsoftLoginRedirect = (req,res) => {
//   const tokenRequest = {
//       code: req.query.code,
//       scopes: ["user.read"],
//       redirectUri: REDIRECT_URI,
//   };

//   pca.acquireTokenByCode(tokenRequest).then( async (response) => {
//       // console.log("\nResponse: \n:", response);
//       request.get({
//         url:"https://graph.microsoft.com/v1.0/me",
//         headers: {
//           "Authorization": "Bearer " + response.accessToken
//         }
//     },function(err, resp, body) {
//       console.log("here");
//       if(err){
//         console.log(err);
//         // res.render('authSuccessView.ejs',{userInfo : "ERROR OCCURED"});
//         return;
//       }
//       const userInfo = JSON.parse(body);
//       console.log(userInfo);
//       const userInfoString = `${userInfo["displayName"]}/${userInfo["mail"]}/${userInfo["surname"]}/${userInfo["id"]}`;
//       console.log(userInfoString);
//       // res.render('authSuccessView.ejs',{userInfo : userInfoString});
//       res.redirect("http://localhost:3000")
//       // res.json(userInfoString)
      
//     });
//   }).catch((error) => {
//       console.log(error);
//       res.status(500).send(error);
//   });
// }
