import axios, {
  type RawAxiosRequestHeaders,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";
import crypto from "crypto";
import moment from "moment";

const env = {
  ETHELO_URL: "https://beta.ethelo.net",
  ETHELO_ACCESS_KEY: "Big-Green-Dao-2023",
  ETHELO_SECRET_KEY:
    "mFBR6rGxa13RSDo6h4aFeBasoOaO49WWQ3pk786SGAgsu5l9Fek7z7dlCxi+fAumjTQkQ2ASQDo9V0QCjyTn7w==",
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
  const secret = Buffer.from(env.ETHELO_SECRET_KEY).toString("base64");
  const authContent = JSON.stringify(requestBody);

  // Create a SHA256 hash of the request body
  const contentSha256 = crypto
    .createHash("sha256")
    .update(authContent)
    .digest("base64");

  // Or MD5 hash
  const contentMd5 = crypto
    .createHash("md5")
    .update(authContent)
    .digest("base64");
  const date = moment().utc().format("ddd, DD MMM YYYY HH:mm:ss") + " GMT";

  const contentType = "application/json";
  const canonicalString = [
    "POST",
    contentType,
    // contentMd5,
    contentSha256,
    `/api/v2/third_party${uri}`,
    date,
  ].join();

  const authHeaderSecret = crypto
    .createHmac("sha1", secret)
    .update(canonicalString)
    .digest("base64");

  const headers: RawAxiosRequestHeaders = {
    "X-HMAC-SHA256": contentSha256,
    // "X-HMAC-MD5": contentMd5,
    DATE: date,
    Authorization: `APIAuth ${env.ETHELO_ACCESS_KEY}:${authHeaderSecret}`,
    "Content-Type": contentType,
  };

  console.log("authContent", authContent);
  console.log("contentSha256", contentSha256);
  console.log("contentMd5", contentMd5);
  console.log("canonical_string", canonicalString);
  console.log("authHeaderSecret", authHeaderSecret);
  console.log("headers", headers);

  // canonical_string = "#{http method},#{content-type},#{X-Authorization-Content-SHA256},#{request URI},#{timestamp}"
  // const canonical = `POST,application/json,${authContent},/api/v2/third_party${uri},${new Date().toUTCString()}`;

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
  return await apiClient.post("/create", requestBody, {
    headers: authenticatedHeaders("/create", requestBody),
  });
};
async function asyncCall() {
  try {
    const result = await createAccount({
      email: "duke@worldtree.io",
      name: "WT",
      decision_subdomain: "bgd-gr15-test",
    });
    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

asyncCall();
