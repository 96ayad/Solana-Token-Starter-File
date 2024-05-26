// import React, { FC, useCallback, useState } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import {
//   Keypair,
//   PublicKey,
//   SystemProgram,
//   Transaction,
// } from "@solana/web3.js";
// import {
//   MINT_SIZE,
//   TOKEN_PROGRAM_ID,
//   createInitializeMintInstruction,
//   getMinimumBalanceForRentExemptMint,
//   getAssociatedTokenAddress,
//   createMintToInstruction,
//   createAssociatedTokenAccountInstruction,
// } from "@solana/spl-token";
// import { 
//   PROGRAM_ID,
//   createCreateMetadataAccountV3Instruction,
//   createCreateMetadataAccountInstruction,
//  } from "@metaplex-foundation/mpl-token-metadata";
// import axios from 'axios';
// import { notify } from "../../utils/notifications";
// import { ClipLoader } from "react-spinners";
// import { useNetworkConfiguration } from "contexts/NetworkConfigurationProvider";

// import { AiOutlineClose } from "react-icons/ai";
// import CreateSVG from "../../components/SVG/CreateSVG";
// // import Branding from '../../components/Branding';
// // import { InputView } from '../index';

// export const CreateView:FC = ({ setOpenCreateModal }) => {
//   const { connection } = useConnection();
//   const { publicKey, sendTransaction } = useWallet();
//   const { networkConfiguration } = useNetworkConfiguration();

//   const [tokenUri, setTokenUri] = useState("");
//   const [tokenMintAddress, setTokenMintAddress] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const [token, setToken] = useState({
//     name: "",
//     Symbol: "",
//     decimals: "",
//     amount: "",
//     image: "",
//     description: "",
//   });

//   const handleFormFieldChange = (fieldName, e) => {
//     setToken({ ...token, [fieldName]: e.target.value });
//   };

//   //CREATE TOKEN FUNCION
//   const createToken = useCallback(
//     async(token) => {
//       const lamports = await getMinimumBalanceForRentExemptMint(connection);
//       const mintKeypair = Keypair.generate();
//       const tokenATA = await getAssociatedTokenAddress(
//         mintKeypair.publicKey,
//         publicKey
//       );

//       try {
//         const metadataUrl = await uploadMetadata(token);
//         console.log(metadataUrl);

//         const createMetadataInstruction = createCreateMetadataAccountV3Instruction({
//             metadata: PublicKey.findProgramAddressSync([
//                 PROGRAM_ID.toBuffer(),
//                 mintKeypair.publicKey.toBuffer(),
//             ],
//             PROGRAM_ID
//         )[0],
//         mint: mintKeypair.publicKey,
//         mintAuthority: publicKey,
//         payer: publicKey,
//         updateAuthority: publicKey,
//         },
//         {
//            createMetadataAccountArgsV3: {
//             data: {
//                 name: token.name,
//                 symbol: token.symbol,
//                 uri: metadataUrl,
//                 creators: null,
//                 sellerFeeBasisPoints: 0,
//                 uses: null,
//                 collection: null,
//             },
//             isMutable: false,
//             collectionDetails: null,
//            },
//         });

//         const createNewTokenTransaction = new Transaction().add(
//             SystemProgram.createAccount({
//                 fromPubkey: publicKey,
//                 newAccountPubkey: mintKeypair.publicKey,
//                 space: MINT_SIZE,
//                 lamports: lamports,
//                 programId: TOKEN_PROGRAM_ID,
//             }),
//             createInitializeMintInstruction(
//                 mintKeypair.publicKey,
//                 Number(token.decimals),
//                 publicKey,
//                 publicKey,
//                 TOKEN_PROGRAM_ID
//             ),
//             createAssociatedTokenAccountInstruction(
//                 publicKey,
//                 tokenATA,
//                 publicKey,
//                 mintKeypair.publicKey
//             ),
//             createMintToInstruction(
//                 mintKeypair.publicKey,
//                 tokenATA,
//                 publicKey,
//                 Number(token.amount) * Math.pow(10, Number(token.decimals))
//             ),
//             createMetadataInstruction
//         );

//         const signature = await sendTransaction(
//             createNewTokenTransaction,
//             connection,
//             {
//                 signers: [mintKeypair],
//             }
//         );

//         setTokenMintAddress(mintKeypair.publicKey.toString());
//         notify({
//             type: "success",
//             message: "Token create successfully",
//             txid: signature,
//         });
//       } catch (error: any) {
//         notify({ type: "error", message: "Token Creation failed, try later" });
//       }
//       setIsLoading(false);
//     },
//     [publicKey, connection, sendTransaction]
//   );

//   //IMAGE UPLOAD IPFS
//   const handleImageChange = async (event) => {
//     const file = event.target.files[0];

//      if (file) {
//         const imgUrl = await uploadImagePinata(file);
//         setToken({ ...token, image: imgUrl });
//     }
//   };

//   const uploadImagePinata = async (file) => {
//     if (file) {
//         try {
//             const formData = new FormData();
//             formData.append("file", file);

//             const response = await axios({
//                 method: "post",
//                 url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
//                 data: formData,
//                 headers: {
//                     pinata_api_key: "",
//                     pinata_secret_api_key:"",
//                     "Content-Type":"multipart/form-data",
//                 },
//             });

//             const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
//             return ImgHash;
//         } catch (error: any) {
//             notify({ type: "error", message: "Upload image failed" });      
//         }
//         setIsLoading(false);
//     }
//   };

//   //METADATA
//   const uploadMetadata = async (token) => {
//     setIsLoading(true);
//     const { name, symbol, description, image } = token;
//     if (!name || !symbol || !description || !image) {
//         return notify({ type: "error", message: "Data Is Missing" });
//     }

//     const data = JSON.stringify({
//         name: name,
//         symbol: symbol,
//         description: description,
//         image: image,
//     });

//     try {
//         const response = await axios({
//             method: "POST",
//             url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
//             data: data,
//             headers: {
//                 pinata_api_key: "",
//                 pinata_secret_api_key:"",
//                 "Content-Type":"application/json",
//             },
//         });

//         const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
//         return url;
//     } catch (error: any) {
//         notify({ type: "error", message: "Upload to Pinnata Json failed" });
//     }
//     setIsLoading(false);
//   };

//   return (
//     <div>index</div>
//   )
// };