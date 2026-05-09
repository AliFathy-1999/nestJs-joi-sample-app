import * as fs from "fs";

const readFile = (file: string)=> {
    try {
        const data = fs.readFileSync(file, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file ${file}:`, error);
        throw new Error(`Failed to read file: ${file}`);
    }
}


export { readFile }