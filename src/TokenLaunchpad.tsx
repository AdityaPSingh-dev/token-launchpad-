import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_2022_PROGRAM_ID, getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType } from "@solana/spl-token"
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';


export function TokenLaunchpad() {
    const { connection } = useConnection();//connects with other nodes 
    const wallet = useWallet();//access to user public key and signing 

    async function createToken() {
        const mintKeypair = Keypair.generate();//mint account generated 
        const metadata = {
            mint: mintKeypair.publicKey,
            name: 'ADITYA',
            symbol: 'ADI   ',
            uri: 'https://cdn.100xdevs.com/metadata.json',
            additionalMetadata: [],
        };

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);//length of mint
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;//metadatalength

        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen); //rent exemption 
if (!wallet.publicKey) {
  throw new Error('Wallet public key is not available');
}// if wallet key not found 
//transaction created 
        const transaction = new Transaction().add(
            //creating account first 
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            //initializing metaData pointer 
            createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
            //initializing mint
            createInitializeMintInstruction(mintKeypair.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
            //add metadata
            createInitializeInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                mint: mintKeypair.publicKey,
                metadata: mintKeypair.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                mintAuthority: wallet.publicKey,
                updateAuthority: wallet.publicKey,
            }),
        );
            //pay transaction fees 
        transaction.feePayer = wallet.publicKey;
        //recent blockhash required  
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
//mintKeypair is a new account and must be signed here 
        transaction.partialSign(mintKeypair);
//signing by wallet adapter 
        await wallet.sendTransaction(transaction, connection);
    }

    return <div className="h-screen flex justify-center items-center flex-col">
        <h1>Solana Token Launchpad</h1>
        <input className='inputText' type='text' placeholder='Name'></input> <br />
        <input className='inputText' type='text' placeholder='Symbol'></input> <br />
        <input className='inputText' type='text' placeholder='Image URL'></input> <br />
        <input className='inputText' type='text' placeholder='Initial Supply'></input> <br />
        <button onClick={createToken} className='btn'>Create a token</button>
    </div>
}