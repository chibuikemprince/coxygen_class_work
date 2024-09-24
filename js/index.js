import {
  bytesToHex,
  Cip30Wallet,
  WalletHelper,
  TxOutput,
  Assets,
  bytesToText,
  hexToBytes,
  AssetClass,
  Tx,
  Address,
  NetworkParams,
  Value,
  MintingPolicyHash,
  Program,
  ByteArrayData,
  ConstrData,
} from "./js/helios.js";

export const hlib = {
  Value: Value,
  Tx: Tx,
  Assets: Assets,
  NetworkParams: NetworkParams,
  ByteArrayData: ByteArrayData,
  BigInt: BigInt,
  ConstrData: ConstrData,
  TxOutput: TxOutput,
  Address: Address,
  hexToBytes: hexToBytes,
  Program: Program,
  MintingPolicyHash: MintingPolicyHash,
};

export const txPrerequisites = {
  maxTxFee: 3000000,
  minChangeAmt: 2000000,
  networkParamsUrl: "https://d1t0d7c2nekuk0.cloudfront.net/preprod.json",
  minAda: 4000000,
};

export const txFunc = async (walletData, hlib, tx, networkParamsUrl) => {
  const networkParams = new hlib.NetworkParams(
    await fetch(networkParamsUrl).then((response) => response.json())
  );
  const spareUtxo = walletData.utxos[1];
  const txBeforeFinal = tx.dump();
  const fnAddress = await walletData.walletHelper.changeAddress;
  await tx.finalize(networkParams, fnAddress, spareUtxo);
  const signature = await walletData.walletAPI.signTx(tx);
  tx.addSignatures(signature);
  const txHash = (await walletData.walletAPI.submitTx(tx)).toHex();

  return txHash;
};
//

export const sendADA = async (
  toAddress,
  amountToTransfer,
  walletData,
  data = {}
) => {
  try {
    const amountToTransferLovelace = Number(amountToTransfer) * 1000000;
    const maxTxFee = txPrerequisites.maxTxFee;
    const minChangeAmt = txPrerequisites.minChangeAmt;

    // Check if txPrerequisites is defined
    if (!txPrerequisites) {
      throw new Error("Transaction prerequisites are not defined");
    }

    const minUTXOVal = new hlib.Value(
      BigInt(amountToTransferLovelace + maxTxFee + minChangeAmt)
    );

    const walletHelper = await walletData.walletHelper;
    const utxos = await walletData.utxos;

    // Check if utxos is defined and has elements
    if (!utxos || utxos.length === 0) {
      throw new Error("No UTXOs available");
    }

    console.log("step1", utxos.length);

    const tx = new Tx();

    // Ensure utxos[0] is defined
    if (!utxos[0]) {
      throw new Error("UTXO at index 0 is undefined");
    }
    console.log({ tx, utxos });

    tx.addInput(utxos);
    console.log("pppd");

    tx.addOutput(
      new hlib.TxOutput(
        hlib.Address.fromBech32(toAddress),
        new hlib.Value(BigInt(amountToTransferLovelace)),
        data
      )
    );
    console.log({ ada: 14 });

    const txh = await txFunc(
      walletData,
      hlib,
      tx,
      txPrerequisites.networkParamsUrl
    );
    console.log({ txh });
  } catch (error) {
    console.error("Error in sendADA:", error);
  }
};

// console.log({ Address });
export const adaFunc = async (walletData) => {
  const balanceLovelace = (
    await walletData.walletHelper.calcBalance()
  ).lovelace.toString();
  return balanceLovelace;
};

export async function init() {
  try {
    const started = "...started";

    const cwindow = window.cardano;

    if (typeof cwindow != "undefined") {
      if (window.cardano.nami) {
        return window.cardano.nami;
      } else if (window.cardano.eternl) {
        returnwindow.cardano.eternl;
      } else if (window.cardano.lace) {
        return window.cardano.lace;
      } else if (window.cardano.flint) {
        return window.cardano.flint;
      } else if (window.cardano.nufi) {
        return window.cardano.nufi;
      } else if (window.cardano.yoroi) {
        return window.cardano.yoroi;
      } else {
        return null;
      }
    } else {
      alert("Please Connnect A Valid Wallet");

      return null;
    }
  } catch (error) {
    console.log({ error });
    return null;
  }
}

export const shortAddressFunc = async (walletData) => {
  const baseAddress = await walletData.walletHelper.baseAddress;
  const bech32Address = baseAddress.toBech32();
  const shortAddress =
    bech32Address.toString().slice(0, 10) +
    "..." +
    bech32Address.toString().substr(bech32Address.length - 5);
  return shortAddress;
};

export async function isWalletEnabled(wallet) {
  console.log("Welcome to Nami");
  try {
    const walletEnabled = await wallet.isEnabled();
    console.log({ walletEnabled });

    console.log("Welcome, Nami conected ", walletEnabled);

    return walletEnabled;
  } catch (err) {
    console.log({ err });
    return null;
  }
}

export async function enableWallet(wallet) {
  const walletHandlers = await wallet.enable();
  return walletHandlers;
}

export async function WalletData(wallet, utxoAmount) {
  try {
    const walletHandler = await wallet.enable();
    const walletAPI = await new Cip30Wallet(walletHandler);

    const walletHelper = new WalletHelper(walletAPI);

    const utxos = await walletHelper.pickUtxos(new Value(BigInt(utxoAmount)));

    /*


const walletHandler = (await wallet.enable()); j.test("walletEssentials","walletHandler",walletHandler).object()
    		const walletAPI = await new Cip30Wallet(walletHandler);j.log({walletAPI}) ;
    		const walletHelper = new WalletHelper(walletAPI); j.log({walletHelper});
    		const utxos = await walletHelper.pickUtxos(new Value(BigInt(utxoAmount)));j.log({utxos});
    		const resObject = {wallet:wallet,walletEnabled:walletEnabled,walletHelper:walletHelper,walletHandler:walletHandler,walletAPI:walletAPI,utxos:utxos}; 
    

*/

    const resObject = {
      wallet: wallet,
      walletEnabled: await isWalletEnabled(wallet),
      walletHelper: walletHelper,
      walletHandler: walletHandler,
      walletAPI: walletAPI,
      utxos: utxos,
    };

    localStorage.setItem("walletData", JSON.stringify(resObject));
    //walletEnabled
    console.log({ resObject });
    return resObject;
  } catch (error) {
    console.log({ error });
    return null;
  }
}

 export function printHtmlReceipt(itemName, itemPrice, imgUrl, txid = "") {
   // Create a modal container
   const modal = document.createElement("div");
   modal.style.position = "fixed";
   modal.style.top = "0";
   modal.style.left = "0";
   modal.style.width = "100%";
   modal.style.height = "100%";
   modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
   modal.style.display = "flex";
   modal.style.justifyContent = "center";
   modal.style.alignItems = "center";
   modal.style.zIndex = "1000";

   // Create a receipt container
   const receiptContainer = document.createElement("div");
   receiptContainer.style.border = "1px solid #000";
   receiptContainer.style.padding = "20px";
   receiptContainer.style.width = "300px";
   receiptContainer.style.backgroundColor = "#fff";
   receiptContainer.style.textAlign = "center";

   // Add title
   const title = document.createElement("h2");
   title.innerText = "****** RECEIPT ******";
   receiptContainer.appendChild(title);

   // Add item name
   const itemElement = document.createElement("p");
   itemElement.innerHTML = `<strong>Item:</strong> ${itemName}`;
   receiptContainer.appendChild(itemElement);

   // Add item price
   const priceElement = document.createElement("p");
   priceElement.innerHTML = `<strong>Price:</strong> $${itemPrice.toFixed(2)}`;
   receiptContainer.appendChild(priceElement);

   // Add transaction ID
   const txidElement = document.createElement("p");
   txidElement.innerHTML = `<strong>Transaction ID:</strong> ${txid}`;
   receiptContainer.appendChild(txidElement);

   // Add image
   const imgElement = document.createElement("img");
   imgElement.src = imgUrl;
   imgElement.alt = itemName;
   imgElement.style.width = "100px"; // Set a width for the image
   imgElement.style.height = "auto"; // Maintain aspect ratio
   receiptContainer.appendChild(imgElement);

   // Add thank you message
   const thankYouMessage = document.createElement("p");
   thankYouMessage.innerText = "******* Thank you for your purchase! *******";
   receiptContainer.appendChild(thankYouMessage);

   // Create a close button
   const closeButton = document.createElement("button");
   closeButton.innerText = "Close";
   closeButton.onclick = function () {
     document.body.removeChild(modal);
   };
   receiptContainer.appendChild(closeButton);

   // Append the receipt container to the modal
   modal.appendChild(receiptContainer);

   // Append the modal to the body
   document.body.appendChild(modal);
 }