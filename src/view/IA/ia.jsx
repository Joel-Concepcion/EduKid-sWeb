import React, { useEffect, useRef, useState } from "react";
import '../../styles/IA/Ia.css';

const LOOP_MONTESSORI_RESPONDER = "1f2a7160-c1fc-48a3-90e3-c4eb7b3b1046";

const COLOR_BG = "#99E7D9";
const COLOR_PRIMARY = "#34B0A6";
const COLOR_WHITE = "#FFFFFF";
const STORAGE_KEY = "montessoriChatHistory";

function IA() {
    const scrollRef = useRef(null);
    const [messages, setMessages] = useState([
        {
            role: "ai",
            content: "¡Hola! Soy tu asistente educativo Montessori. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre los principios Montessori, materiales, ambiente preparado, o cualquier tema relacionado con este método educativo.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [voiceGender, setVoiceGender] = useState("female");
    const [speechRate, setSpeechRate] = useState(1.0);
    const [guidedOpen, setGuidedOpen] = useState(false);

    // Cargar historial
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length) {
                    setMessages(parsed);
                }
            } catch (error) {
                console.error("Error al cargar historial:", error);
            }
        }
    }, []);

    // Guardar historial
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch (error) {
            console.error("Error al guardar historial:", error);
        }
    }, [messages]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            setTimeout(() => {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 100);
        }
    }, [messages, loading]);

    const cleanTextForSpeech = (text) => {
        let cleaned = text;
        cleaned = cleaned.replace(/(\d+)\./g, "número $1");
        cleaned = cleaned.replace(/\*/g, "");
        return cleaned.trim();
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "es-ES";
            utterance.rate = speechRate;
            utterance.pitch = 1;
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    const addMessage = (role, content) => {
        setMessages((prev) => [...prev, { role, content }]);
    };

    const buildPayload = (userText) => {
        return {
            userMessage: userText,
            userRole: "padre",
            voiceGender: voiceGender,
            speechRate: Number(speechRate) || 1.0,
            conversationHistory: messages.map((m) => ({
                sender: m.role === "user" ? "user" : "assistant",
                text: m.content,
            })),
        };
    };

    const callAPI = async (promptText) => {
        let textoFinal = promptText;

        // Lista MUY permisiva de palabras clave - acepta casi cualquier pregunta
        const palabrasClave = [
            // Montessori
            "montessori", "maria", "pedagogia", "educacion", "enseñanza", 
            "aprendizaje", "escuela", "colegio", "maestro", "profesor", 
            "docente", "alumno", "estudiante", "niño", "niña", "infantil",
            
            // Términos generales de educación
            "aula", "clase", "leccion", "actividad", "ejercicio", "tarea",
            "material", "juego", "didactico", "enseñar", "aprender", "estudiar",
            
            // Desarrollo
            "desarrollo", "crecimiento", "etapa", "edad", "cognitivo", 
            "emocional", "social", "motor", "lenguaje", "habla",
            
            // Materias
            "matematicas", "lengua", "español", "ciencias", "historia", 
            "geografia", "arte", "musica", "educacion fisica", "deporte",
            
            // Habilidades
            "lectura", "escritura", "calculo", "logica", "razonamiento",
            "creatividad", "imaginacion", "concentracion", "atencion", "memoria",
            
            // Palabras comunes de preguntas
            "que", "como", "cuando", "donde", "porque", "para que", "cual",
            "ayuda", "consejo", "sugerencia", "idea", "recomendacion"
        ];

        // Transformar preguntas generales de educación a Montessori
        if (!promptText.toLowerCase().includes("montessori") && 
            (promptText.toLowerCase().includes("educacion") || 
             promptText.toLowerCase().includes("enseñanza") ||
             promptText.toLowerCase().includes("aprendizaje"))) {
            textoFinal = `Desde el enfoque Montessori, ${promptText}`;
        }

        // Verificación MUY permisiva - acepta casi cualquier pregunta
        const textoMinusculas = textoFinal.toLowerCase();
        const esTemaValido = palabrasClave.some(palabra => 
            textoMinusculas.includes(palabra.toLowerCase())
        ) || textoFinal.length > 3; // Acepta cualquier texto de más de 3 caracterés

        console.log("🔍 Texto analizado:", textoFinal);
        console.log("🔍 Es tema válido:", esTemaValido);

        if (!esTemaValido) {
            addMessage("ai", "¡Hola! Soy tu asistente Montessori. Puedo ayudarte con temas de educación, desarrollo infantil, materiales de aprendizaje, estrategias pedagógicas y mucho más. ¿En qué puedo asistirte?");
            return;
        }

        setLoading(true);
        try {
            console.log("📤 Enviando consulta a la API...");
            
            // Timeout más largo - 45 segundos para dar tiempo a la API
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log("⏰ Timeout alcanzado, abortando...");
                controller.abort();
            }, 45000); // 45 segundos

            const response = await fetch(
                `https://magicloops.dev/api/loop/${LOOP_MONTESSORI_RESPONDER}/run`,
                {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(buildPayload(textoFinal)),
                    signal: controller.signal,
                    mode: 'cors'
                }
            );

            clearTimeout(timeoutId);
            console.log("✅ Respuesta recibida, status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Error en la respuesta:", response.status, errorText);
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log("📥 Datos recibidos:", data);
            
            // Múltiples campos posibles de respuesta
            const reply = data?.replyText || data?.message || data?.output || 
                         data?.response || data?.content || 
                         "Gracias por tu pregunta. Como asistente Montessori, te recomiendo explorar los materiales sensoriales y el ambiente preparado para fomentar el desarrollo natural del niño.";
            
            addMessage("ai", reply);
            
            // Leer automáticamente la respuesta
            const cleaned = cleanTextForSpeech(reply);
            speak(cleaned);

        } catch (error) {
            console.error("💥 Error en callAPI:", error);
            
            if (error.name === 'AbortError') {
                // Cuando hay timeout, mostrar mensaje amigable pero no bloquear
                addMessage("ai", "La respuesta está tomando más tiempo de lo usual. Mientras tanto, te puedo decir que el método Montessori se enfoca en el desarrollo natural del niño a través de materiales diseñados específicamente y un ambiente preparado que fomenta la independencia.");
            } else if (error.message.includes('Failed to fetch')) {
                addMessage("ai", "Parece que hay un problema de conexión. Verifica tu internet e intenta nuevamente. Mientras tanto, ¿hay algo específico sobre Montessori que te gustaría saber?");
            } else {
                addMessage("ai", "Voy a responder basándome en el método Montessori: se centra en respetar el ritmo individual de cada niño y proporcionar materiales que permitan el autoaprendizaje en un ambiente preparado. ¿Te gustaría profundizar en algún aspecto específico?");
            }
        } finally {
            setLoading(false);
        }
    };

    const onSend = () => {
        const text = input.trim();
        if (!text) return;
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        
        addMessage("user", text);
        setInput("");
        callAPI(text);
    };

    const onTopic = (topic) => {
        const text = `Cuéntame sobre ${topic} en el método Montessori`;
        addMessage("user", text);
        callAPI(text);
    };

    const onGuided = (key) => {
        let promptText = "";
        switch (key) {
            case "docente":
                promptText = "¿Cómo puedo aplicar los principios Montessori como docente?";
                break;
            case "actividades":
                promptText = "Actividades Montessori para diferentes edades";
                break;
            case "citas":
                promptText = "Citas inspiradoras de María Montessori";
                break;
            case "adaptaciones":
                promptText = "Adaptaciones Montessori por etapas de desarrollo";
                break;
            default:
                return;
        }
        setGuidedOpen(false);
        addMessage("user", promptText);
        callAPI(promptText);
    };

    const onNewConversation = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        localStorage.removeItem(STORAGE_KEY);
        setMessages([
            {
                role: "ai",
                content: "¡Hola! Soy tu asistente educativo Montessori. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre los principios Montessori, materiales, ambiente preparado, o cualquier tema relacionado con este método educativo.",
            },
        ]);
    };

    const cycleVoiceGender = () => {
        setVoiceGender((g) => (g === "female" ? "male" : "female"));
    };
    
    const decRate = () => setSpeechRate((r) => Math.max(0.5, +(r - 0.1).toFixed(1)));
    const incRate = () => setSpeechRate((r) => Math.min(1.5, +(r + 0.1).toFixed(1)));

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="container">
            {/* Header */}
            <div className="header">
                <div className="headerLeft">
                    <span className="childIcon">👶</span>
                    <div className="headerTitle">Montessori AI</div>
                </div>

                {/* Controles de voz */}
                <div className="voiceControls">
                    <button className="voicePill" onClick={cycleVoiceGender}>
                        <span className="voiceIcon"></span>
                        <div className="voicePillText">
                            {voiceGender === "female" ? "Femenina" : "Masculina"}
                        </div>
                    </button>

                    <div className="rateBox">
                        <button onClick={decRate} className="rateBtn">➖</button>
                        <div className="rateText">{speechRate.toFixed(1)}x</div>
                        <button onClick={incRate} className="rateBtn">➕</button>
                    </div>

                    <button onClick={onNewConversation} className="newConvBtn">
                        <span className="plusIcon">+</span>
                        <div className="newConvText">Nueva</div>
                    </button>
                </div>
            </div>

            {/* Modo Guiado */}
            <div className="guidedWrap">
                <button className="guidedBtn" onClick={() => setGuidedOpen((x) => !x)}>
                    <span className="mapIcon">🗺️</span>
                    <div className="guidedText">Modo Guiado</div>
                    <span className="chevronIcon">{guidedOpen ? "▲" : "▼"}</span>
                </button>

                {guidedOpen && (
                    <div className="guidedMenu">
                        <div className="guidedItem" onClick={() => onGuided("docente")}>
                            <div className="guidedItemText">Cómo aplicar en el colegio</div>
                            <span className="arrowIcon">→</span>
                        </div>
                        <div className="guidedItem" onClick={() => onGuided("actividades")}>
                            <div className="guidedItemText">Diseñar actividades</div>
                            <span className="arrowIcon">→</span>
                        </div>
                        <div className="guidedItem" onClick={() => onGuided("citas")}>
                            <div className="guidedItemText">Citas de María Montessori</div>
                            <span className="arrowIcon">→</span>
                        </div>
                        <div className="guidedItem" onClick={() => onGuided("adaptaciones")}>
                            <div className="guidedItemText">Adaptaciones por etapa</div>
                            <span className="arrowIcon">→</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Temas */}
            <div className="topicsRow">
                <button className="topicBtn" onClick={() => onTopic("Ambiente Preparado")}>
                    <span className="topicIcon">🏠</span>
                    <div className="topicText">Ambiente Preparado</div>
                </button>
                <button className="topicBtn" onClick={() => onTopic("Materiales Sensoriales")}>
                    <span className="topicIcon">🧩</span>
                    <div className="topicText">Materiales Sensoriales</div>
                </button>
                <button className="topicBtn" onClick={() => onTopic("Educación Cósmica")}>
                    <span className="topicIcon">🌍</span>
                    <div className="topicText">Educación Cósmica</div>
                </button>
                <button className="topicBtn" onClick={() => onTopic("Autonomía")}>
                    <span className="topicIcon">🔑</span>
                    <div className="topicText">Autonomía</div>
                </button>
                <button className="topicBtn" onClick={() => onTopic("Ciclos de Desarrollo")}>
                    <span className="topicIcon">📚</span>
                    <div className="topicText">Ciclos de Desarrollo</div>
                </button>
            </div>

            {/* Chat */}
            <div ref={scrollRef} className="chat">
                {messages.map((m, i) => (
                    <Bubble key={i} role={m.role} text={m.content} onSpeak={() => speak(m.content)} />
                ))}
                {loading && <TypingIndicator />}
            </div>

            {/* Input */}
            <div className="inputBar">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu pregunta sobre Montessori..."
                    className="input"
                    disabled={loading}
                />
                <button className="sendBtn" onClick={onSend} disabled={loading}>
                    <span className="sendIcon">{loading ? "⏳" : "➤"}</span>
                </button>
            </div>
        </div>
    );
}

function Bubble({ role, text, onSpeak }) {
    const isUser = role === "user";
    return (
        <div className={`bubble ${isUser ? 'bubbleUser' : 'bubbleAI'}`}>
            <div className={`bubbleText ${isUser ? 'userText' : 'aiText'}`}>
                {text}
            </div>
            {!isUser && (
                <button onClick={onSpeak} className="speaker">
                    <span className="volumeIcon">🔊</span>
                </button>
            )}
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="typingWrap">
            <div className="dot"></div>
            <div className="dot" style={{ opacity: 0.6 }}></div>
            <div className="dot" style={{ opacity: 0.3 }}></div>
        </div>
    );
}

export default IA;