import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, Trash2, Check, Copy, X, 
  Loader2, Plus, FolderOpen, AlertCircle, RefreshCw, ExternalLink 
} from 'lucide-react';

export interface UploadedImageItem {
  id: string;
  filename: string;
  url: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}

interface ImageBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (url: string) => void;
  title?: string;
}

export const ImageBankModal: React.FC<ImageBankModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  title = 'Banco de Imagens & Upload do Computador',
}) => {
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all uploaded images
  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/uploaded-images');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setImages(json.data);
      }
    } catch (e) {
      console.warn('Could not load image bank:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  // Upload file helper
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, SVG ou GIF).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('A imagem excede o tamanho máximo suportado de 15MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Read as DataURL (Base64)
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64,
              filename: file.name,
            }),
          });

          const json = await res.json();
          if (json.success && json.data) {
            setImages((prev) => [json.data, ...prev.filter((i) => i.filename !== json.data.filename)]);
            if (onSelectImage) {
              onSelectImage(json.url);
              onClose();
            }
          } else {
            setUploadError(json.error || 'Erro ao salvar imagem no servidor.');
          }
        } catch (err) {
          setUploadError('Falha ao enviar imagem. Verifique sua conexão.');
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setUploadError('Não foi possível ler o arquivo do computador.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError('Erro ao iniciar upload.');
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteImage = async (filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja excluir esta imagem do banco de dados do site?')) return;

    try {
      const res = await fetch(`/api/upload-image/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setImages((prev) => prev.filter((i) => i.filename !== filename));
      }
    } catch (e) {
      console.warn('Failed to delete image:', e);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FAF7F0] border border-[#E3DCCE] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-[#EBE4D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#435B47] text-[#FAF7F0] flex items-center justify-center shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-lg text-[#2D2A26]">
                {title}
              </h2>
              <p className="text-xs text-[#6B655B]">
                Suba fotos do seu computador para armazenar permanentemente no site
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchImages}
              disabled={isLoading}
              className="p-2 rounded-xl text-[#6B655B] hover:text-[#2D2A26] hover:bg-[#FAF7F0] transition-colors"
              title="Atualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#6B655B] hover:text-[#2D2A26] hover:bg-[#FAF7F0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Upload Dropzone Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? 'border-[#435B47] bg-[#EAE4D5]'
                : 'border-[#D5CDBD] bg-white hover:border-[#435B47] hover:bg-[#FDFBF7]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#F0ECE1] text-[#435B47] flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="w-7 h-7 animate-spin text-[#435B47]" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-[#2D2A26]">
                  {isUploading ? 'Enviando imagem do computador...' : 'Clique para escolher uma foto ou arraste o arquivo aqui'}
                </p>
                <p className="text-xs text-[#8C8375] mt-1">
                  Formatos aceitos: PNG, JPG, WEBP, GIF e SVG (até 15MB)
                </p>
              </div>

              <button
                type="button"
                disabled={isUploading}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-2 bg-[#435B47] hover:bg-[#344738] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Escolher Arquivo do Computador</span>
              </button>
            </div>
          </div>

          {/* Upload Error Message */}
          {uploadError && (
            <div className="p-4 rounded-xl bg-[#FDF2F2] border border-[#F8D7D7] text-[#9B1C1C] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Stored Images Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif-brand font-bold text-sm text-[#2D2A26] flex items-center gap-2">
                <span>Fotos Armazenadas no Banco</span>
                <span className="text-xs font-normal text-[#8C8375]">
                  ({images.length} {images.length === 1 ? 'imagem' : 'imagens'})
                </span>
              </h3>
              {onSelectImage && (
                <span className="text-[11px] text-[#435B47] font-semibold">
                  Clique na foto para selecionar
                </span>
              )}
            </div>

            {isLoading && images.length === 0 ? (
              <div className="py-12 text-center text-[#8C8375] text-xs flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#435B47]" />
                <span>Carregando banco de imagens...</span>
              </div>
            ) : images.length === 0 ? (
              <div className="py-12 bg-white rounded-2xl border border-[#EBE4D8] text-center p-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F0] text-[#8C8375] flex items-center justify-center mx-auto">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-[#544F46]">Nenhuma imagem enviada ainda</p>
                <p className="text-xs text-[#8C8375]">
                  Use a área acima para subir a primeira foto do seu computador.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div
                    key={img.id || img.filename}
                    onClick={() => {
                      if (onSelectImage) {
                        onSelectImage(img.url);
                        onClose();
                      }
                    }}
                    className={`group relative bg-white rounded-2xl border border-[#EBE4D8] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col ${
                      onSelectImage ? 'cursor-pointer hover:border-[#435B47] ring-2 ring-transparent hover:ring-[#435B47]/20' : ''
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-[#FAF7F0] relative overflow-hidden flex items-center justify-center">
                      <img
                        src={img.url}
                        alt={img.originalName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Quick Select Overlay */}
                      {onSelectImage && (
                        <div className="absolute inset-0 bg-[#435B47]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 p-2 text-center">
                          <Check className="w-4 h-4" />
                          <span>Selecionar</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between bg-white text-[11px]">
                      <div className="font-medium text-[#2D2A26] truncate mb-1" title={img.originalName}>
                        {img.originalName}
                      </div>

                      <div className="text-[10px] text-[#8C8375] flex items-center justify-between mb-2">
                        <span>{formatBytes(img.sizeBytes)}</span>
                        <span>{new Date(img.uploadedAt).toLocaleDateString('pt-BR')}</span>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1 border-t border-[#F0ECE1]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(img.url, img.id);
                          }}
                          className="flex-1 bg-[#FAF7F0] hover:bg-[#EAE4D5] text-[#544F46] py-1 px-2 rounded-lg font-semibold text-[10px] flex items-center justify-center gap-1 transition-colors"
                          title="Copiar URL relativa ou completa"
                        >
                          {copiedId === img.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#24572D]" />
                              <span className="text-[#24572D]">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar URL</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteImage(img.filename, e)}
                          className="p-1 text-[#8C8375] hover:text-[#9B1C1C] hover:bg-[#FDF2F2] rounded-lg transition-colors"
                          title="Excluir imagem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#EBE4D8] flex items-center justify-between text-xs text-[#8C8375]">
          <span>Todas as imagens ficam salvas na pasta pública do servidor (`/updates`).</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-[#D5CDBD] text-[#544F46] hover:bg-[#FAF7F0] font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
