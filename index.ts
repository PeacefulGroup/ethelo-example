import axios, {
  type RawAxiosRequestHeaders,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";
import crypto from "crypto";
import moment from "moment";
import * as CryptoJS from "crypto-js";

const env = {
  ETHELO_URL: "https://beta.ethelo.net",
  ETHELO_ACCESS_KEY: "Big-Green-Dao-2023",
  ETHELO_SECRET_KEY:
    "mFBR6rGxa13RSDo6h4aFeBasoOaO49WWQ3pk786SGAgsu5l9Fek7z7dlCxi+fAumjTQkQ2ASQDo9V0QCjyTn7w==",
};

const signing = {
  // eslint-disable-next-line @typescript-eslint/no-implicit-any
  signedHeaders(url, data, accessId, secretKey) {
    var dataHash = CryptoJS.SHA256(JSON.stringify(data));
    dataHash = CryptoJS.enc.Base64.stringify(dataHash);

    var dateString =
      moment().utc().format("ddd, DD MMM YYYY HH:mm:ss") + " GMT";

    var contentString = [
      "POST",
      "application/json",
      dataHash,
      url,
      dateString,
    ].join(",");

    var hmacSig = CryptoJS.HmacSHA256(contentString, secretKey).toString(
      CryptoJS.enc.Base64
    );

    var headers = {
      "X-Authorization-Content-SHA256": dataHash,
      Authorization: `APIAuth-HMAC-SHA256 ${accessId}:${hmacSig}`,
    };
    return headers;
  },
  signingRequest() {
    let endpoint = "/api/v2/third_party/create.json";
    let accessId = "Big-Green-Dao-2023";
    let secretKey =
      "mFBR6rGxa13RSDo6h4aFeBasoOaO49WWQ3pk786SGAgsu5l9Fek7z7dlCxi+fAumjTQkQ2ASQDo9V0QCjyTn7w==";
    let url = "https://beta.ethelo.net";
    let timestamp = moment().valueOf();
    let data = {
      user: {
        name: `Test ${timestamp}`,
        email: `test${timestamp}@test.com`,
        send_email: false,
        decision_subdomain: "quadresults",
      },
    };

    // let request = $.ajax({
    //   url: url + endpoint,
    //   type: "POST",
    //   dataType: "json",
    //   data: JSON.stringify(data),
    //   contentType: "application/json",
    //   crossDomain: true,
    //   headers: this.signedHeaders(endpoint, data, accessId, secretKey),
    // });

    // request.fail((xhr, textStatus, error) => {
    //   //jshint unused:false
    //   console.log(error);
    // });

    // return request;
  },
};

const apiClient: AxiosInstance = axios.create({
  baseURL: `${env.ETHELO_URL}/api/v2/third_party`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// apiClient.interceptors.request.use((request) => {
//   console.log("Starting Request", request);
//   return request;
// });

// apiClient.interceptors.response.use((response) => {
//   console.log("Response:", response);
//   return response;
// });

//////////////////////////////////////////////
// ETHelo API
const authenticatedHeaders = (
  uri: string,
  requestBody: Record<string, string | boolean>
): RawAxiosRequestHeaders => {
  // const secret = Buffer.from(env.ETHELO_SECRET_KEY).toString("base64");
  const secret = env.ETHELO_SECRET_KEY;
  const authContent = JSON.stringify(requestBody);
  const contentSha256 = crypto
    .createHash("sha256")
    .update(authContent)
    .digest("base64");

  const date = moment().utc().format("ddd, DD MMM YYYY HH:mm:ss") + " GMT";

  const canonicalString = [
    "POST",
    "application/json",
    contentSha256,
    `/api/v2/third_party${uri}`,
    date,
  ].join(",");

  const authHeaderSecret = crypto
    .createHmac("sha256", secret)
    .update(canonicalString)
    .digest("base64");

  const headers: RawAxiosRequestHeaders = {
    "X-Authorization-Content-SHA256": contentSha256,
    Authorization: `APIAuth-HMAC-SHA256 ${env.ETHELO_ACCESS_KEY}:${authHeaderSecret}`,
    // DATE: date,
    // "Content-Type": "application/json",
  };

  // console.log("authContent", authContent);
  // console.log("contentSha256", contentSha256);
  console.log("canonical_string", canonicalString);
  // console.log("authHeaderSecret", authHeaderSecret);
  // console.log("headers", headers);

  return headers;
};

// The account creation endpoint will create an Ethelo User account, as well as a Decision specific sub account for a specified decision.
// Accounts do not have to be created for each decision.
// The success response contains a one use url to login to the decision
export const createAccount = async ({
  email,
  name,
  decision_subdomain,
  send_email = false,
}: {
  email: string;
  name: string;
  decision_subdomain: string;
  send_email?: boolean;
}): Promise<any> => {
  const requestBody = {
    "user[email]": email,
    "user[name]": name,
    "user[send_email]": send_email,
    "user[decision_subdomain]": decision_subdomain,
  };
  console.log(requestBody);
  return await apiClient.post("/create.json", JSON.stringify(requestBody), {
    headers: authenticatedHeaders("/create.json", requestBody),
  });
};
async function asyncCall() {
  try {
    let timestamp = moment().valueOf();
    const result = await createAccount({
      name: `Test ${timestamp}`,
      email: `test${timestamp}@test.com`,
      // email: "duke@worldtree.io",
      // name: "WT",
      decision_subdomain: "quadresults",
    });
    console.log(result);
  } catch (error: any) {
    console.error("Error:", error);
    console.error(error.response.data.errors);
  }
}

asyncCall();
