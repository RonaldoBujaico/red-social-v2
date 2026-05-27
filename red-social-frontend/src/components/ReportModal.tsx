import React, { useState } from "react";
import { X, Flag, AlertTriangle } from "lucide-react";
import { createReportRequest } from "@/api/report.api";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportedPostId?: number;
    reportedCommentId?: number;
    reportedUserId?: number;
    reportedTargetName?: string; // e.g. "este post", "este comentario", "@username"
}

const REASONS = [
    "Spam o contenido repetitivo",
    "Acoso, intimidación o incitación al odio",
    "Contenido inapropiado o sensible (violencia, desnudez)",
    "Información falsa o engañosa",
    "Infracción de derechos de autor o propiedad intelectual",
    "Otro motivo",
];

export default function ReportModal({
    isOpen,
    onClose,
    reportedPostId,
    reportedCommentId,
    reportedUserId,
    reportedTargetName = "este contenido",
}: ReportModalProps) {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) {
            setError("Por favor, selecciona un motivo para el reporte.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            await createReportRequest({
                reason,
                description,
                reportedPostId,
                reportedCommentId,
                reportedUserId,
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setReason("");
                setDescription("");
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error("Error al enviar el reporte:", err);
            setError(err.response?.data?.message || "Ocurrió un error al enviar el reporte. Por favor intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div 
                className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-500 font-semibold">
                        <Flag size={18} />
                        <h3>Reportar Contenido</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition p-1 rounded-full hover:bg-muted"
                    >
                        <X size={18} />
                    </button>
                </div>

                {success ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-bold text-foreground mb-2">Reporte Enviado</h4>
                        <p className="text-sm text-muted-foreground">
                            Gracias por ayudarnos a mantener segura la comunidad. Revisaremos tu reporte pronto.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            ¿Por qué quieres reportar <span className="font-semibold text-foreground">{reportedTargetName}</span>?
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
                                <AlertTriangle size={14} className="flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Reasons list */}
                        <div className="space-y-2 max-h-48 overflow-y-auto mb-4 pr-1">
                            {REASONS.map((r) => (
                                <label 
                                    key={r}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-sm transition-all ${
                                        reason === r 
                                            ? "border-yellow-500 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400 font-medium" 
                                            : "border-border hover:bg-muted text-foreground"
                                    }`}
                                >
                                    <input 
                                        type="radio" 
                                        name="reportReason" 
                                        value={r}
                                        checked={reason === r}
                                        onChange={() => setReason(r)}
                                        className="accent-yellow-500 w-4 h-4 cursor-pointer"
                                    />
                                    <span>{r}</span>
                                </label>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                                Detalles adicionales (opcional)
                            </label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Proporciona más detalles si es necesario..."
                                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-500 transition resize-none h-24 text-foreground placeholder:text-muted-foreground"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border text-foreground hover:bg-muted transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !reason}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition flex items-center gap-2"
                            >
                                {loading ? "Enviando..." : "Enviar Reporte"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
