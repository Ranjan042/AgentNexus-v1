import {tool} from "@langchain/core/tools";
import {z} from "zod";
import axios from "axios";

export const ListFilesTool = tool(
    async ({},config) => {
        console.log("Using list files tool");
        try {
            const sandboxId=config.configurable?.sandboxId;

            config?.writer?.({
                type: "tool_start",
                tool: "list_files",
                description: "Lists the files in the sandbox",
            })

            if(!sandboxId){
                throw new Error("Sandbox id is required");
            }

            console.log(`http://sandbox-${sandboxId}-service:3000/api/listfiles`);

            // const response=await axios.get(`http://sandbox-${sandboxId}-service:3000/api/listfiles`);
            config.writer?.({
                type: "tool_end",
                tool: "list_files",
                description: "Lists the files in the sandbox",
            })
            const response=await axios.get(`http://sandbox-${sandboxId}-service:3000/api/listfiles`);

            // console.log(response.data);

            return response.data;
        }catch (error) {
            config.writer?.({
                type: "error",
                tool: "list_files",
                description: "Error listing files: "+error.message,
            })
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

            config?.writer?.({
                type: "tool_start",
                tool: "read_files",
                description: "Reading files: "+files,
            })

            if(!sandboxId){
                throw new Error("Sandbox id is required");
            }
            console.log("Sandbox ID:", sandboxId);
            console.log("Files:", files);

            const response=await axios.get(`http://sandbox-${sandboxId}-service:3000/api/readfiles?files=${files}`);
           
            config.writer?.({
                type: "tool_end",
                tool: "read_files",
                description: "Finished reading files: "+files,
            })


            // console.log(response.data);

            return response.data;
        }catch (error) {
            config.writer?.({
                type: "error",
                tool: "read_files",
                description: "Error reading files: "+error.message,
            })
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

            config?.writer?.({
                type: "tool_start",
                tool: "update_files",
                description: "Updating files",
            })


            if(!sandboxId){
                throw new Error("Sandbox id is required");
            }

            
            const response=await axios.patch(`http://sandbox-${sandboxId}-service:3000/api/updatefiles`,{updates});

            config.writer?.({
                type: "tool_end",
                tool: "update_files",
                description: "Finished updating files",
            })
            // console.log(response.data);

            return response.data;
        }catch (error) {
            config.writer?.({
                type: "error",
                tool: "update_files",
                description: "Error updating files: "+error.message,
            })
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

            config?.writer?.({
                type: "tool_start",
                tool: "move_files",
                description: "Moving files"+files,
            })

            const response=await axios.patch(`http://sandbox-${sandboxId}-service:3000/api/movefiles`,{files});

            config.writer?.({
                type: "tool_end",
                tool: "move_files",
                description: "Finished moving files"+files,
            })

            return response.data;
        }catch (error) {

            config.writer?.({
                type: "error",
                tool: "move_files",
                description: "Error moving files: "+error.message,
            })
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

            config?.writer?.({
                type: "tool_start",
                tool: "delete_files",
                description: "Deleting files"+files,
            })

            const response=await axios.delete(`http://sandbox-${sandboxId}-service:3000/api/deletefiles?files=${files}`);

            config.writer?.({
                type: "tool_end",
                tool: "delete_files",
                description: "Finished deleting files"+files,
            })
            return response.data;
        }catch (error) {

            config.writer?.({
                type: "error",
                tool: "delete_files",
                description: "Error deleting files: "+error.message,
            })
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

            congig?.writer?.({
                type: "tool_start",
                tool: "search_files",
                description: "Searching files"+query+" in "+path,
            })

            const response=await axios.get(`http://sandbox-${sandboxId}-service:3000/api/searchfiles?q=${query}&path=${path}`);

            config.writer?.({
                type: "tool_end",
                tool: "search_files",
                description: "Finished searching files"+query+" in "+path,
            })

            return response.data;
        }catch (error) {

            config.writer?.({
                type: "error",
                tool: "search_files",
                description: "Error searching files: "+error.message,
            })
            throw new Error(`Error searching files: ${error.message}`);
        }
    },
    {
        name: "search_files",
        description: "Searches the files in the sandbox",
        schema: z.object({query: z.string(), path: z.string()}),
    }
)

export const ExecuteCommandTool=tool(
    async ({command},config) => {
        try {
            const sandboxId=config.configurable?.sandboxId;

            if(!sandboxId){
                throw new Error("Sandbox id is required");
            }

            config.writer?.({
                type: "tool_start",
                tool: "execute_command",
                description: "Executing command: "+command, 
            })

            const response=await axios.post(`http://sandbox-${sandboxId}-service:3000/api/command/execute`,{command});

            config.writer?.({
                type: "tool_end",
                tool: "execute_command",
                description: "Finished executing command: "+command,
            })

            return response.data;
        }catch (error) {

            config.writer?.({
                type: "error",
                tool: "execute_command",
                description: "Error executing command: "+error.message,
            })
            throw new Error(`Error executing command: ${error.message}`);
        }
    },
    {
        name: "execute_command",
        description: "Executes a command in the sandbox",
        schema: z.object({command: z.string()}),
    }
)

