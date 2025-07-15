import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StudentInvitationRequest {
  studentName: string;
  studentEmail: string;
  invitationId: string;
  teacherName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentName, studentEmail, invitationId, teacherName }: StudentInvitationRequest = await req.json();

    const registrationUrl = `${Deno.env.get("SUPABASE_URL")?.replace('/rest/v1', '')}/auth?invitation=${invitationId}`;

    const emailResponse = await resend.emails.send({
      from: "EduTranscribe <onboarding@resend.dev>",
      to: [studentEmail],
      subject: `Invitación para unirte a la clase de ${teacherName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">¡Bienvenido a EduTranscribe!</h1>
          
          <p>Hola <strong>${studentName}</strong>,</p>
          
          <p>El profesor <strong>${teacherName}</strong> te ha invitado a unirte a su clase en EduTranscribe.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; text-align: center;">
              <a href="${registrationUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Completar mi Registro
              </a>
            </p>
          </div>
          
          <p>Al hacer clic en el botón, podrás:</p>
          <ul>
            <li>Crear tu contraseña</li>
            <li>Acceder a tus clases programadas</li>
            <li>Ver tu perfil de estudiante</li>
          </ul>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
            <span style="word-break: break-all;">${registrationUrl}</span>
          </p>
          
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px; text-align: center;">
            Si no esperabas esta invitación, puedes ignorar este correo.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-student-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);