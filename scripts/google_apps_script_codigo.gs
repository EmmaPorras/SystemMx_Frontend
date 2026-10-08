/**
 * ============================================================================
 * SYSTEMMX — SERVICIO SEGURO DE CORREOS TRANSACCIONALES (Google Apps Script)
 * ============================================================================
 * Remitente oficial: receptor847@gmail.com
 * Función principal: doPost(e)
 *
 * Configuración en Apps Script:
 * 1. Abrir Configuración del proyecto > Propiedades de la secuencia de comandos.
 * 2. Propiedad requerida: SYSTEMMX_MAIL_SECRET
 *    (Clave secreta en Base64 configurada de forma idéntica en NestJS).
 * 3. Implementar como Aplicación Web:
 *    - Ejecutar como: "Yo" (receptor847@gmail.com)
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone)
 * ============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'Cuerpo de solicitud vacío' });
    }

    var scriptProperties = PropertiesService.getScriptProperties();
    var secret = String(scriptProperties.getProperty('SYSTEMMX_MAIL_SECRET') || '').trim();
    if (!secret) {
      return jsonResponse({ success: false, error: 'SYSTEMMX_MAIL_SECRET no está configurado en Apps Script' });
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ success: false, error: 'JSON malformado' });
    }

    // 1. Validar tipos y formatos de timestamp, nonce y signature
    var timestamp = payload.timestamp;
    var nonce = payload.nonce;
    var signature = payload.signature;

    if (typeof timestamp !== 'number' || !Number.isInteger(timestamp) || timestamp <= 0) {
      return jsonResponse({ success: false, error: 'Parámetro timestamp inválido o faltante' });
    }

    if (typeof nonce !== 'string' || !/^[a-fA-F0-9]{16,64}$/.test(nonce)) {
      return jsonResponse({ success: false, error: 'Parámetro nonce inválido (debe ser hex de 16 a 64 caracteres)' });
    }

    if (typeof signature !== 'string' || !/^[a-fA-F0-9]{64}$/.test(signature)) {
      return jsonResponse({ success: false, error: 'Parámetro signature inválido (debe ser hex de 64 caracteres)' });
    }

    // 2. Validar ventana de tiempo (300 segundos) ANTES de tocar el almacenamiento de nonces
    var nowSeconds = Math.floor(new Date().getTime() / 1000);
    var age = Math.abs(nowSeconds - timestamp);
    if (isNaN(age) || age > 300) {
      return jsonResponse({ success: false, error: 'Firma expirada o timestamp desfasado (> 300s)' });
    }

    // Reconstruir payload canónico idéntico a NestJS
    var corePayload = {
      to: String(payload.to || '').trim().toLowerCase(),
      recipientName: String(payload.recipientName || '').trim(),
      type: String(payload.type || '').trim(),
      actionUrl: String(payload.actionUrl || '').trim(),
      expirationMinutes: Number(payload.expirationMinutes),
      lang: String(payload.lang || 'es').trim(),
      from: String(payload.from || 'receptor847@gmail.com').trim()
    };

    var canonicalString = timestamp + '.' + nonce + '.' + JSON.stringify(corePayload);
    var expectedSignature = computeHmacSha256(canonicalString, secret);

    // 3. Validar firma HMAC-SHA256 ANTES de registrar el nonce
    if (signature.toLowerCase() !== expectedSignature.toLowerCase()) {
      return jsonResponse({ success: false, error: 'Firma digital HMAC inválida' });
    }

    // 4. Mecanismo antirrepetición: SOLO una vez validada la firma y antigüedad
    var cache = CacheService.getScriptCache();
    var nonceKey = 'sysmx_nonce_' + nonce;
    if (cache.get(nonceKey)) {
      return jsonResponse({ success: false, error: 'Solicitud duplicada (nonce ya utilizado)' });
    }
    // Registrar el nonce por 6 minutos (360 segundos)
    cache.put(nonceKey, '1', 360);

    // 5. Validación estricta de parámetros de negocio
    if (!corePayload.to || !validateEmail(corePayload.to)) {
      return jsonResponse({ success: false, error: 'Destinatario de correo inválido' });
    }

    if (corePayload.type !== 'INVITACION' && corePayload.type !== 'RECUPERACION_PASSWORD') {
      return jsonResponse({ success: false, error: 'Tipo de mensaje no permitido' });
    }

    // 6. Análisis estricto de URL (HTTPS, host exacto onrender.com, rutas exactas y token)
    var urlValidation = parseAndValidateActionUrl(corePayload.actionUrl, corePayload.type);
    if (!urlValidation.valid) {
      return jsonResponse({ success: false, error: 'URL de acción inválida: ' + urlValidation.error });
    }

    // Usar la URL sanitizada validada
    corePayload.actionUrl = urlValidation.sanitizedUrl;

    // 7. Generar plantilla HTML segura con escapado anti-XSS y enviar
    var templateData = generateEmailTemplate(corePayload);

    MailApp.sendEmail({
      to: corePayload.to,
      subject: templateData.subject,
      body: templateData.plainText,
      htmlBody: templateData.html,
      name: 'SystemMx'
    });

    return jsonResponse({
      success: true,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    return jsonResponse({ success: false, error: 'Error interno: ' + error.message });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Cálculo de HMAC-SHA256 idéntico a Node.js crypto
 */
function computeHmacSha256(message, secret) {
  var rawHmac = Utilities.computeHmacSha256Signature(message, secret);
  return rawHmac.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

/**
 * Escapado seguro contra inyección HTML y atributos (XSS)
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validador estricto de formato de correo
 */
function validateEmail(email) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validador estricto y seguro de la URL de acción
 */
function parseAndValidateActionUrl(urlString, expectedType) {
  if (typeof urlString !== 'string' || !urlString) {
    return { valid: false, error: 'URL requerida' };
  }

  // Regex estricto para análisis completo de URL HTTPS con o sin fragmento (#) de HashRouter
  var urlRegex = /^https:\/\/([a-zA-Z0-9.-]+)(?::([0-9]+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/;
  var match = urlString.match(urlRegex);
  if (!match) {
    return { valid: false, error: 'La URL debe usar protocolo HTTPS válido' };
  }

  var host = (match[1] || '').toLowerCase();
  var port = match[2];
  var pathname = match[3] || '/';
  var search = match[4] || '';
  var hash = match[5] || '';

  // Host exacto requerido en producción — Sin subdominios, sin parecidos, sin localhost
  var ALLOWED_HOST = 'systemmx-web-200684331.onrender.com';
  if (host !== ALLOWED_HOST) {
    return { valid: false, error: 'Host no autorizado (' + host + ')' };
  }

  if (port && port !== '443') {
    return { valid: false, error: 'Puerto no estándar no permitido' };
  }

  // Determinar la ruta efectiva:
  // Si usa HashRouter (ej. /#/activar-cuenta), extraer la ruta y query params del hash.
  var effectiveRoute = pathname;
  var queryToParse = search;
  var isHashRouter = false;

  if (hash) {
    isHashRouter = true;
    var cleanHash = hash.replace(/^\/+/, ''); // quitar leading slash
    var hashQueryIdx = cleanHash.indexOf('?');
    if (hashQueryIdx !== -1) {
      effectiveRoute = '/' + cleanHash.slice(0, hashQueryIdx).replace(/^\/+/, '');
      queryToParse = cleanHash.slice(hashQueryIdx + 1);
    } else {
      effectiveRoute = '/' + cleanHash;
      if (!queryToParse && search) {
        queryToParse = search;
      }
    }
  }

  // Correspondencia obligatoria entre tipo de acción y ruta
  var expectedRoute = expectedType === 'INVITACION' ? '/activar-cuenta' : '/restablecer-contrasena';
  if (expectedType !== 'INVITACION' && expectedType !== 'RECUPERACION_PASSWORD') {
    return { valid: false, error: 'Tipo de acción desconocido' };
  }

  if (effectiveRoute !== expectedRoute) {
    return { valid: false, error: 'Ruta no autorizada para ' + expectedType.toLowerCase() + ' (' + effectiveRoute + ')' };
  }

  // Parsear query parameters
  var params = {};
  var searchPairs = queryToParse.split('&');
  for (var i = 0; i < searchPairs.length; i++) {
    if (!searchPairs[i]) continue;
    var parts = searchPairs[i].split('=');
    var key = decodeURIComponent(parts[0]);
    var val = parts.length > 1 ? decodeURIComponent(parts.slice(1).join('=')) : '';
    params[key] = val;
  }

  var token = params['token'];
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Parámetro token requerido' };
  }

  // Token debe ser hexadecimal de 32 a 128 caracteres
  if (!/^[a-fA-F0-9]{32,128}$/.test(token)) {
    return { valid: false, error: 'Formato de token inválido' };
  }

  var sanitizedUrl;
  if (isHashRouter) {
    sanitizedUrl = 'https://' + ALLOWED_HOST + '/#' + expectedRoute + '?token=' + encodeURIComponent(token);
  } else {
    sanitizedUrl = 'https://' + ALLOWED_HOST + expectedRoute + '?token=' + encodeURIComponent(token);
  }

  return { valid: true, sanitizedUrl: sanitizedUrl };
}

/**
 * Generador de plantillas seguras en Español, Inglés y Portugués con escapado HTML
 */
function generateEmailTemplate(data) {
  var lang = data.lang || 'es';
  var rawName = data.recipientName || 'Usuario';
  var safeName = escapeHtml(rawName);
  var safeUrl = escapeHtml(data.actionUrl);
  var minutes = Math.max(1, Math.round(data.expirationMinutes || 30));
  var hours = Math.max(1, Math.round(minutes / 60));

  var isInvitacion = data.type === 'INVITACION';

  var texts = {
    es: {
      invSubject: 'Invitación a SystemMx — Activa tu cuenta',
      recSubject: 'Restablecer contraseña — SystemMx',
      greeting: 'Hola, ' + safeName + ':',
      invBody: 'Has sido invitado a formar parte del equipo de <strong>SystemMx</strong>, sistema de administración comercial e inventarios. Para comenzar, define tu contraseña y activa tu cuenta a través del siguiente botón seguro:',
      recBody: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>SystemMx</strong>. Puedes ingresar tu nueva contraseña mediante el siguiente botón seguro:',
      invBtn: 'Crear Contraseña y Activar Cuenta',
      recBtn: 'Restablecer Mi Contraseña',
      invExp: 'Este enlace de invitación es de un solo uso y expirará en ' + hours + ' horas.',
      recExp: 'Este enlace de recuperación es de un solo uso y expirará en ' + minutes + ' minutos.',
      ignore: 'Si no reconoces esta acción, puedes ignorar este mensaje de manera segura. Tu cuenta permanece protegida.',
      fallback: 'Si tienes problemas con el botón, copia y pega este enlace seguro en tu navegador:'
    },
    en: {
      invSubject: 'Invitation to SystemMx — Activate your account',
      recSubject: 'Reset password — SystemMx',
      greeting: 'Hello, ' + safeName + ':',
      invBody: 'You have been invited to join <strong>SystemMx</strong>, business management and inventory system. To get started, set your password and activate your account using the secure button below:',
      recBody: 'We received a request to reset the password for your <strong>SystemMx</strong> account. You can set a new password using the secure button below:',
      invBtn: 'Create Password and Activate Account',
      recBtn: 'Reset My Password',
      invExp: 'This invitation link is single-use and will expire in ' + hours + ' hours.',
      recExp: 'This recovery link is single-use and will expire in ' + minutes + ' minutes.',
      ignore: 'If you did not request this, you can safely ignore this email. Your account remains secure.',
      fallback: 'If you have trouble with the button, copy and paste this link into your browser:'
    },
    pt: {
      invSubject: 'Convite para o SystemMx — Ative sua conta',
      recSubject: 'Redefinir senha — SystemMx',
      greeting: 'Olá, ' + safeName + ':',
      invBody: 'Você foi convidado a fazer parte do <strong>SystemMx</strong>, sistema de gestão comercial e estoque. Para começar, defina sua senha e ative sua conta através do botão seguro abaixo:',
      recBody: 'Recebemos uma solicitação para redefinir a senha da sua conta no <strong>SystemMx</strong>. Você pode definir uma nova senha usando o botão seguro abaixo:',
      invBtn: 'Criar Senha e Ativar Conta',
      recBtn: 'Redefinir Minha Senha',
      invExp: 'Este link de convite é de uso único e expirará em ' + hours + ' horas.',
      recExp: 'Este link de recuperação é de uso único e expirará em ' + minutes + ' minutos.',
      ignore: 'Se você não solicitou esta ação, pode ignorar esta mensagem com segurança.',
      fallback: 'Se tiver problemas com o botão, copie e cole este link seguro no seu navegador:'
    }
  };

  var t = texts[lang] || texts['es'];
  var subject = isInvitacion ? t.invSubject : t.recSubject;
  var bodyHtml = isInvitacion ? t.invBody : t.recBody;
  var btnText = isInvitacion ? t.invBtn : t.recBtn;
  var expText = isInvitacion ? t.invExp : t.recExp;

  var html = '' +
    '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '  <meta charset="utf-8">' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '  <title>' + escapeHtml(subject) + '</title>' +
    '</head>' +
    '<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#334155;">' +
    '  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0f172a;padding:40px 10px;">' +
    '    <tr>' +
    '      <td align="center">' +
    '        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.3);">' +
    '          <tr>' +
    '            <td style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%);padding:32px;text-align:center;border-bottom:3px solid #3b82f6;">' +
    '              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:1px;">SystemMx</h1>' +
    '              <p style="margin:6px 0 0 0;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;">Administración & Inventarios</p>' +
    '            </td>' +
    '          </tr>' +
    '          <tr>' +
    '            <td style="padding:36px 32px;">' +
    '              <h2 style="margin:0 0 16px 0;font-size:18px;color:#0f172a;font-weight:600;">' + t.greeting + '</h2>' +
    '              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#475569;">' + bodyHtml + '</p>' +
    '              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:28px 0;">' +
    '                <tr>' +
    '                  <td align="center">' +
    '                    <a href="' + safeUrl + '" target="_blank" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:10px;box-shadow:0 4px 12px rgba(37,99,235,0.35);letter-spacing:0.3px;">' + escapeHtml(btnText) + '</a>' +
    '                  </td>' +
    '                </tr>' +
    '              </table>' +
    '              <div style="background-color:#f8fafc;border-left:4px solid #3b82f6;padding:14px 16px;border-radius:0 8px 8px 0;margin:24px 0 20px 0;">' +
    '                <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">' + escapeHtml(expText) + '</p>' +
    '              </div>' +
    '              <p style="margin:20px 0 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">' + escapeHtml(t.ignore) + '</p>' +
    '              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 16px 0;" />' +
    '              <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.4;word-break:break-all;">' + escapeHtml(t.fallback) + '<br /><a href="' + safeUrl + '" style="color:#2563eb;text-decoration:none;">' + safeUrl + '</a></p>' +
    '            </td>' +
    '          </tr>' +
    '          <tr>' +
    '            <td style="background-color:#f1f5f9;padding:20px;text-align:center;font-size:12px;color:#94a3b8;">' +
    '              © ' + new Date().getFullYear() + ' SystemMx. Todos los derechos reservados.<br />Remitente oficial: receptor847@gmail.com' +
    '            </td>' +
    '          </tr>' +
    '        </table>' +
    '      </td>' +
    '    </tr>' +
    '  </table>' +
    '</body>' +
    '</html>';

  var plainText = subject + '\n\n' +
    'Hola, ' + rawName + ':\n\n' +
    (isInvitacion ? 'Has sido invitado a SystemMx para activar tu cuenta.' : 'Recibimos una solicitud para restablecer tu contraseña en SystemMx.') + '\n\n' +
    'Acción: ' + data.actionUrl + '\n\n' +
    expText + '\n\n' +
    t.ignore + '\n\n' +
    'SystemMx — receptor847@gmail.com';

  return {
    subject: subject,
    html: html,
    plainText: plainText
  };
}

function jsonResponse(obj) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
