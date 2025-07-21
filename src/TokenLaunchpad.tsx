import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
    TOKEN_2022_PROGRAM_ID,
    getMintLen,
    createInitializeMetadataPointerInstruction,
    createInitializeMintInstruction,
    TYPE_SIZE,
    LENGTH_SIZE,
    ExtensionType,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction,
} from "@solana/spl-token";
import {
    createInitializeInstruction,
    pack,
} from '@solana/spl-token-metadata';

export function TokenLaunchpad() {
    const { connection } = useConnection();
    const wallet = useWallet();

    async function createToken() {
        if (!wallet.publicKey) {
            throw new Error('Wallet public key is not available');
        }

        const mintKeypair = Keypair.generate();
        const metadata = {
            mint: mintKeypair.publicKey,
            name: 'ADITYA',
            symbol: 'ADI   ',
            uri: 'https://adityapsingh-dev.github.io/tokenJson/example.json',
            additionalMetadata: [],
        };

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

        // Create the mint account & metadata
        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeMetadataPointerInstruction(
                mintKeypair.publicKey,
                wallet.publicKey,
                mintKeypair.publicKey,
                TOKEN_2022_PROGRAM_ID
            ),
            createInitializeMintInstruction(
                mintKeypair.publicKey,
                9,
                wallet.publicKey,
                null,
                TOKEN_2022_PROGRAM_ID
            ),
            createInitializeInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                mint: mintKeypair.publicKey,
                metadata: mintKeypair.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                mintAuthority: wallet.publicKey,
                updateAuthority: wallet.publicKey,
            })
        );

        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(mintKeypair);

        const sig1 = await wallet.sendTransaction(transaction, connection);
        await connection.confirmTransaction({ signature: sig1, ...(await connection.getLatestBlockhash()) });
        console.log(`✅ Mint account created: https://explorer.solana.com/tx/${sig1}?cluster=devnet`);

        // Create associated token account
        const associatedToken = getAssociatedTokenAddressSync(
            mintKeypair.publicKey,
            wallet.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID
        );

        const transaction2 = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedToken,
                wallet.publicKey,
                mintKeypair.publicKey,
                TOKEN_2022_PROGRAM_ID
            )
        );

        const sig2 = await wallet.sendTransaction(transaction2, connection);
        await connection.confirmTransaction({ signature: sig2, ...(await connection.getLatestBlockhash()) });
        console.log(`✅ Associated Token Account created: https://explorer.solana.com/tx/${sig2}?cluster=devnet`);

        // Mint tokens to ATA
        const transaction3 = new Transaction().add(
            createMintToInstruction(
                mintKeypair.publicKey,
                associatedToken,
                wallet.publicKey,
                1000000000, // 1 token with 9 decimals
                [],
                TOKEN_2022_PROGRAM_ID
            )
        );

        const sig3 = await wallet.sendTransaction(transaction3, connection);
        await connection.confirmTransaction({ signature: sig3, ...(await connection.getLatestBlockhash()) });
        console.log(`✅ Tokens minted: https://explorer.solana.com/tx/${sig3}?cluster=devnet`);

        // Check balance to verify minting
        const balance = await connection.getTokenAccountBalance(associatedToken);
        console.log(`💰 Token Balance in wallet: ${balance.value.uiAmountString}`);
    }

    return (
        <div className="h-32 flex justify-center items-center flex-col pb-4">
            <h1>Solana Token Launchpad</h1>
            <input className='inputText' type='text' placeholder='Name' /><br />
            <input className='inputText' type='text' placeholder='Symbol' /><br />
            <input className='inputText' type='text' placeholder='Image URL' /><br />
            <input className='inputText' type='text' placeholder='Initial Supply' /><br />
            <button onClick={createToken} className='btn'>Create a token</button>
        </div>
    );
}
