import {readFile, writeFile} from 'node:fs/promises'
import {getDate, monSecret} from "./divers.js";
import {NotFoundError} from "./errors.js";
import {createHash} from 'node:crypto'
import { v4 as uuidv4 } from 'uuid';


/* Chemin de stockage des blocks */
const path = './data/blockchain.json';

/**
 * Mes définitions
 * @typedef { id: string, nom: string, don: number, date: string,hash: string} Block
 * @property {string} id
 * @property {string} nom
 * @property {number} don
 * @property {string} date
 * @property {string} string
 *
 */

/**
 * Renvoie un tableau json de tous les blocks
 * @return {Promise<any>}
 */


export async function findBlocks() {
    try {
        const data = await readFile(path, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {
            return { error: "Le fichier blockchain.json est introuvable. Aucun bloc disponible." };
        }
        throw error;
    }
}

function calculateHash(block) {
    const blockString = JSON.stringify(block);
    return createHash('sha256').update(blockString).digest('hex');
}



/**
 * Trouve un block à partir de son id
 * @param partialBlock
 * @return {Promise<Block[]>}
 */
export async function findBlock(partialBlock) {
    try {
        const data = await findBlocks();
        if (data.error) {
            return data;
        }

        const blocks = data.filter(block => block.id === partialBlock.id);
        return blocks.length > 0 ? blocks : { error: "Aucun bloc correspondant trouvé." };
    } catch (error) {
        throw error;
    }
}

/**
 * Trouve le dernier block de la chaine
 * @return {Promise<Block|null>}
 */
export async function findLastBlock() {
    try {
        const blockchain = await findBlocks();
        return blockchain.length > 0 ? blockchain[blockchain.length - 1] : null;
    } catch (error) {
        console.error('[ERROR] Failed to find the last block:', error);
        return null;
    }
}

/**
 * Creation d'un block depuis le contenu json
 * @param contenu
 * @return {Promise<Block[]>}
 */
/*
export async function createBlock(contenu) {
    // Création du bloc
    const newBlock = {
        id: uuidv4(),
        nom: contenu.nom,
        don: contenu.don,
        date: getDate(),
        hash: ""
    };

    console.log('[INFO] Nouveau bloc créé:', newBlock);

    let blockchain = [];
    try {
        const data = await readFile(path, 'utf-8');
        blockchain = JSON.parse(data);

        if (!Array.isArray(blockchain)) {
            console.log('[WARN] Le contenu du fichier blockchain.json n\'est pas un tableau, création d\'un nouveau tableau.');
            blockchain = [];
        }

        console.log('[INFO] Blockchain existante lue:', blockchain);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('[INFO] Fichier blockchain.json introuvable, création d\'un nouveau fichier.');
        } else {
            throw error;
        }
    }

    blockchain.push(newBlock);
    console.log('[INFO] Blockchain mise à jour:', blockchain);
    await writeFile(path, JSON.stringify(blockchain, null, 2));

    return blockchain;
}
*/
export async function createBlock(contenu) {
    try {
        // Création du nouveau bloc
        const newBlock = {
            id: uuidv4(),
            nom: contenu.nom,
            don: contenu.don,
            date: getDate(),
            hash: ''
        };
        const lastBlock = await findLastBlock();

        if (lastBlock) {
            newBlock.hash = calculateHash(lastBlock);
        }

        const blockchain = await findBlocks();
        blockchain.push(newBlock);

        await writeFile(path, JSON.stringify(blockchain, null, 2));

        console.log('[INFO] Nouveau bloc créé:', newBlock);

        return newBlock;
    } catch (error) {
        console.error('[ERROR] Failed to create block:', error);
        throw error;
    }
}
