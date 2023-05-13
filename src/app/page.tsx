"use client"

import "@/styles/globals.css";
import "@/styles/classes.css";

import { useState } from "react";
import axios from "axios";
import {
  SismoConnectButton,
  SismoConnectClientConfig,
  SismoConnectResponse,
  AuthType,
} from "@sismo-core/sismo-connect-react";

export const sismoConnectConfig: SismoConnectClientConfig = {
  // You can create a new Sismo Connect app at https://factory.sismo.io
  appId: "0x3c48bcee0d62fe08d9236f186f245415",
};

type UserType = {
  id: string;
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState<UserType>(null);

  async function verify(response: SismoConnectResponse) {
    // First we update the react state to show the loading state
    setLoading(true);

    try {
      // We send the response to our backend to verify the proof
      const res = await axios.post(`/api/level-1-verify-user`, {
        response,
      });

      const user = res.data;

      // If the proof is valid, we update the user react state to show the user profile
      setVerifiedUser({
        id: user.id,
      });
    } catch (e) {
      // Else if the proof is invalid, we show an error message
      setError("Invalid response");
      console.error(e);
    } finally {
      // We set the loading state to false to show the user profile
      setLoading(false);
    }
  }

  return (
    <div className="container">
      {!verifiedUser && (
          <>
            <h1>ZK License verification</h1>
            <p className="subtitle-page">
                Your ownership of the license will be verified without revealing your address and public private keys. 
            </p>
            <SismoConnectButton
            config={sismoConnectConfig}
            auths={[{ authType: AuthType.VAULT }]}
            claims={[{ groupId: "0x3adc181791f9fb91199bb67f3d70baa2" }]}
            signature={{
              message: "License verification",
              isSelectableByUser: false, // Not allow the user to change the message (here his user name) during the Sismo Connect flow
            }}
            onResponse={(response: SismoConnectResponse) => verify(response)}
            loading={loading}
            text="Register with Sismo"
            />
            <>{error}</>
          </>
      )}
      {verifiedUser && (
          <>
            <h1>You have verified your license</h1>
            <p className="subtitle-page">
              Application was automatically started. You can close browser.
            </p>
            <div className="profile-container">
              <h2 style={{ marginBottom: 10 }}>User Profile</h2>
              <div style={{ marginBottom: 10 }}>
                <b>UserId:</b>
                <p>{verifiedUser.id}</p>
              </div>
            </div>
          </>
        )}
    </div>
  )
}