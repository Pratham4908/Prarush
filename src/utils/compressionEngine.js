// Prarush Local Compression Engine: Genuine client-side stream compression
// Uses standard Web API CompressionStream('gzip') to produce authentic compressed archives.

export async function compressBlob(blobOrFile) {
  if (!blobOrFile) throw new Error('No file provided for compression.');

  if (typeof CompressionStream !== 'undefined') {
    const stream = blobOrFile.stream().pipeThrough(new CompressionStream('gzip'));
    const response = new Response(stream);
    const compressedBlob = await response.blob();
    const originalSize = blobOrFile.size;
    const compressedSize = compressedBlob.size;
    const savingsPercent = originalSize > 0 
      ? Math.max(0, Math.round((1 - (compressedSize / originalSize)) * 100)) 
      : 0;

    return {
      success: true,
      compressedBlob,
      originalSize,
      compressedSize,
      savingsPercent,
      format: 'gzip',
      fileNameSuffix: '.gz'
    };
  }

  throw new Error('CompressionStream is not supported in this browser environment.');
}
