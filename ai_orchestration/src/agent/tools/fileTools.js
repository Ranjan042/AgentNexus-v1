import {tool} from "@langchain/core/tools";
import {z} from "zod";
import axios from "axios";

export const ListFilesTool = tool(
    async ({},config) => {
        console.log("Using list files tool");
        try {
            const sandboxId=config.configurable?.sandboxId;

            if(!sandboxId){
                throw new Error("Sandbox id is required");
            }

            console.log(`http://sandbox-${sandboxId}-service:3000/api/listfiles`);

            // const response=await axios.get(`http://sandbox-${sandboxId}-service:3000/api/listfiles`);

            const response=await axios.get(`http://sandbox-${sandboxId}.agent.localhost/api/listfiles`);

            // console.log(response.data);

            return response.data;
        }catch (error) {
            throw new Error(`Error listing files: ${error.message}`);
        }
    },
    {
        name: "list_files",
        description: "Lists the files in the sandbox",
        schema: z.object({}),
    }
)

export const ReadFilesTool = tool(
    async ({files},config) => {
        console.log("Using read files tool");
        try {
            const sandboxId=config.configurable?.sandboxId;

            if(!sandboxId){
                throw new Error("Sandbox id is required");
            }
            console.log("Sandbox ID:", sandboxId);
            console.log("Files:", files);

            const response=await axios.get(`http://sandbox-${sandboxId}.agent.localhost/api/readfiles?files=${files}`);

            // console.log(response.data);

            return response.data;
        }catch (error) {
            throw new Error(`Error reading files: ${error.message}`);
        }
    },
    {
        name: "read_files",
        description: "Reads the files in the sandbox",
        schema: z.object({files: z.string()}),
    }
)

export const UpdateFilesTool = tool(
    async ({updates},config) => {
        console.log("Using update files tool");
        try {
            const sandboxId=config.configurable?.sandboxId;

            console.log("Sandbox ID:", sandboxId);
            console.log("Updates:", updates);


            if(!sandboxId){
                throw new Error("Sandbox id is required");
            }

            const response=await axios.post(`http://sandbox-${sandboxId}.agent.localhost/api/updatefiles`,{updates});

            // console.log(response.data);

            return response.data;
        }catch (error) {
            throw new Error(`Error updating files: ${error.message}`);
        }
    },
    {
        name: "update_files",
        description: "Updates the files in the sandbox",
        schema: z.object({updates: z.array(z.object({path: z.string(), content: z.string()}))}),
    }
)

export const MoveFilesTool = tool(
    async ({files},config) => {
        try {
            const sandboxId=config.configurable?.sandboxId;

            if(!sandboxId){
                throw new Error("Sandbox id is required");
            }

            console.log("Sandbox ID:", sandboxId);
            console.log("Files:", files);

            const response=await axios.post(`http://sandbox-${sandboxId}.agent.localhost/api/movefiles`,{files});

            return response.data;
        }catch (error) {
            throw new Error(`Error moving files: ${error.message}`);
        }
    },
    {
        name: "move_files",
        description: "Moves the files in the sandbox",
        schema: z.object({files: z.array(z.object({from: z.string(), to: z.string()}))}),
    }
)

export const DeleteFilesTool = tool(
    async ({files},config) => {
        try {
            const sandboxId=config.configurable?.sandboxId;

            if(!sandboxId){
                throw new Error("Sandbox id is required");
            }

            console.log("Sandbox ID:", sandboxId);
            console.log("Files:", files);

            const response=await axios.delete(`http://sandbox-${sandboxId}.agent.localhost/api/deletefiles?files=${files}`);

            return response.data;
        }catch (error) {
            throw new Error(`Error deleting files: ${error.message}`);
        }
    },
    {
        name: "delete_files",
        description: "Deletes the files in the sandbox",
        schema: z.object({files: z.string()}),  
    }
)

export const SearchFilesTool=tool(
    async ({query,path},config) => {
        try {
            const sandboxId=config.configurable?.sandboxId;

            if(!sandboxId){
                throw new Error("Sandbox id is required");
            }

            const response=await axios.get(`http://sandbox-${sandboxId}.agent.localhost/api/searchfiles?q=${query}&path=${path}`);

            return response.data;
        }catch (error) {
            throw new Error(`Error searching files: ${error.message}`);
        }
    },
    {
        name: "search_files",
        description: "Searches the files in the sandbox",
        schema: z.object({query: z.string(), path: z.string()}),
    }
)


