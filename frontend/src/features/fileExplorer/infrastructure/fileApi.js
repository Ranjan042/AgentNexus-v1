import { createSandboxClient, unwrap } from '../../../shared/api/httpClient'

export async function listFiles(sandboxId) {
  const client = createSandboxClient(sandboxId)
  console.log("client", client)
  return unwrap(client.get('/listfiles'))
}

export async function readFiles(sandboxId, files) {
  const client = createSandboxClient(sandboxId)
  const query = Array.isArray(files) ? files.join(',') : files
  return unwrap(client.get('/readfiles', { params: { files: query } }))
}

export async function updateFiles(sandboxId, updates) {
  const client = createSandboxClient(sandboxId)
  return unwrap(client.patch('/updatefiles', { updates }))
}

export async function deleteFiles(sandboxId, files) {
  const client = createSandboxClient(sandboxId)
  const query = Array.isArray(files) ? files.join(',') : files
  return unwrap(client.delete('/deletefiles', { params: { files: query } }))
}

export async function moveFiles(sandboxId, files) {
  const client = createSandboxClient(sandboxId)
  return unwrap(client.patch('/movefiles', { files }))
}

export async function searchFiles(sandboxId, query, path) {
  const client = createSandboxClient(sandboxId)
  return unwrap(
    client.get('/search', {
      params: {
        q: query,
        ...(path ? { path } : {}),
      },
    }),
  )
}
