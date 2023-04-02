import Block from "../models/Block";

const { Level } = require('level')

const db = new Level('./blockchain-db', { valueEncoding: 'json' });

export async function addBlockToDB(block: Block): Promise<void> {
    await db.put(block.blockNumber, JSON.stringify(block));
}

export async function getBlockFromDB(blockNumber: number): Promise<Block | null> {
    try {
        const blockData = await db.get(blockNumber);
        return JSON.parse(blockData);
    } catch (error: any) {
        if (error.code === 'LEVEL_NOT_FOUND') {
            return null;
        }
        throw error;
    }
}