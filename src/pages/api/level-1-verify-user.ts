// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  SismoConnect,
  SismoConnectServerConfig,
  AuthType,
  SismoConnectVerifiedResult,
} from "@sismo-core/sismo-connect-server";
import { exec } from 'child_process';

/************************************************ */
/************* CONFIGURE SISMO CONNECT ********** */
/************************************************ */

// define the SismoConnect configuration
const sismoConnectConfig: SismoConnectServerConfig = {
  // you can create a new Sismo Connect app at https://factory.sismo.io
  appId: "0x3c48bcee0d62fe08d9236f186f245415",
};

// create a SismoConnect instance
const sismoConnect = SismoConnect(sismoConnectConfig);

/************************************************ */
/***************** THE API ROUTE **************** */
/************************************************ */

// this is the API route that is called by the SismoConnectButton
export default async function handler(req: NextApiRequest, res: NextApiResponse<UserType | void>) {
  const { response } = req.body;

  console.log("response", response);
  try {
    const result: SismoConnectVerifiedResult = await sismoConnect.verify(response, {
      auths: [{ authType: AuthType.VAULT }],
      claims: [{ groupId: "0x6cff585cc9b3708d47c50fab5363cb8e" }],
      signature: {
        message: "License verification",
        isSelectableByUser: false,
      },
    });

    const user = {
      // the userId is an app-specific, anonymous identifier of a vault
      // userId = hash(userVaultSecret, appId).
      id: result.getUserId(AuthType.VAULT),
      name: result.getSignedMessage(),
    };

    const command = 'echo "Hello, World!"';

    // Start protected software
    const childProcess = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`Output error: ${stderr}`);
        return;
      }

      console.log(`Result: ${stdout}`);
    });

    // Обработка события завершения выполнения команды
    childProcess.on('exit', (code, signal) => {
      console.log(`Executed with code ${code} and signal ${signal}`);
    });


    res.status(200).send(user);

    // process.exit(0);
  } catch (e: any) {
    console.error(e);
    res.status(400).send(null);
  }
}
