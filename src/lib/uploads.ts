import { getAccessToken } from "./session";
import { apiBaseUrl } from "./trpc";

export type UploadedImagePayload = {
  url: string;
  blobId: number;
};

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `Falha no upload (HTTP ${response.status}).`;
  } catch {
    return `Falha no upload (HTTP ${response.status}).`;
  }
}

function buildAuthHeader(): HeadersInit {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  return {
    authorization: `Bearer ${accessToken}`,
  };
}

export async function uploadProfileImage(file: File): Promise<UploadedImagePayload> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${apiBaseUrl}/upload/profile-image`, {
    method: "POST",
    headers: buildAuthHeader(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as {
    image?: UploadedImagePayload;
  };

  if (!body.image?.url || !body.image.blobId) {
    throw new Error("Resposta de upload de perfil invalida.");
  }

  return body.image;
}

export async function uploadProductImages(files: File[]): Promise<UploadedImagePayload[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("images", file);
  }

  const response = await fetch(`${apiBaseUrl}/upload/product-images`, {
    method: "POST",
    headers: buildAuthHeader(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as {
    images?: UploadedImagePayload[];
  };

  if (!Array.isArray(body.images)) {
    throw new Error("Resposta de upload de produto invalida.");
  }

  for (const image of body.images) {
    if (!image?.url || !image.blobId) {
      throw new Error("Resposta de upload de produto invalida.");
    }
  }

  return body.images;
}
