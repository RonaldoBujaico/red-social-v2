import { transporter } from "./mailer";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export const sendVerificationEmail = async (email: string, token: string) => {
    const url = `${BACKEND_URL}/auth/verify/${token}`;

    await transporter.sendMail({
        from: `"Red Social" <no-reply@turedsocial.com>`,
        to: email,
        subject: "Verifica tu cuenta",
        html: `
            <h2>Verifica tu cuenta</h2>
            <p>Haz clic en el siguiente enlace:</p>
            <a href="${url}">Activar cuenta</a>
        `,
    });
};

export const sendLoginAlertEmail = async (
    email: string,
    data: {
        browser?: string;
        os?: string;
        ip?: string;
        token: string;
    },
) => {
    const trustUrl = `${BACKEND_URL}/auth/sessions/trust-email?token=${data.token}`;
    const blockUrl = `${BACKEND_URL}/auth/sessions/block-email?token=${data.token}`;

    await transporter.sendMail({
        from: `"Red Social" <no-reply@turedsocial.com>`,
        to: email,
        subject: "Nuevo inicio de sesión detectado",
        html: `
            <h2>Nuevo inicio de sesión</h2>

            <p><b>Dispositivo:</b> ${data.browser || "Desconocido"} - ${data.os || "Desconocido"}</p>
            <p><b>IP:</b> ${data.ip || "Desconocida"}</p>

            <hr/>

            <p>¿Fuiste tú?</p>

            <a href="${trustUrl}" 
               style="padding:10px;background:green;color:white;text-decoration:none;display:inline-block;margin-right:10px;">
                ✔ Sí fui yo
            </a>

            <a href="${blockUrl}" 
               style="padding:10px;background:red;color:white;text-decoration:none;display:inline-block;">
                ✖ No fui yo
            </a>

            <p style="margin-top:20px;color:gray;font-size:12px;">
                Si no haces nada, la sesión seguirá activa pero no confiable.
            </p>
        `,
    });
};

export const sendWarningEmail = async (email: string, username: string, reason: string) => {
    try {
        await transporter.sendMail({
            from: `"Moderación - Red Social" <no-reply@turedsocial.com>`,
            to: email,
            subject: "Advertencia formal de moderación",
            html: `
                <h2>Hola @${username},</h2>
                <p>Hemos recibido reportes sobre tu actividad en nuestra plataforma.</p>
                <p><b>Motivo de la advertencia:</b> ${reason}</p>
                <hr/>
                <p>Por favor, asegúrate de cumplir con nuestras Normas de la Comunidad para evitar la suspensión temporal o permanente de tu cuenta.</p>
                <p style="color:gray;font-size:12px;margin-top:20px;">
                    Este es un mensaje automático de moderación. Por favor, no respondas a este correo.
                </p>
            `,
        });
    } catch (error) {
        console.error("Error al enviar el correo de advertencia:", error);
    }
};
