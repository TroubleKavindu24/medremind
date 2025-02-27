import { useEffect, useState } from "react";
import { Text, StyleSheet, View, TouchableOpacity, Dimensions, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function AuthScreen() {
    const [hasBiometrics, setHasBiometrics] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [supportedTypes, setSupportedTypes] = useState<number[]>([]);

    const router = useRouter();

    useEffect(() => {
        checkBiometrics();
    }, []);

    const checkBiometrics = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

            console.log("Has biometric hardware:", hasHardware);
            console.log("Is biometric authentication enrolled:", isEnrolled);
            console.log("Supported authentication types:", supportedTypes);

            setHasBiometrics(hasHardware && isEnrolled);
            setSupportedTypes(supportedTypes);
        } catch (error) {
            console.error("Error checking biometrics:", error);
        }
    };

    const authenticate = async () => {
        try {
            setIsAuthenticating(true);
            setError(null);

            if (!hasBiometrics) {
                setError("Biometric authentication is not available. Please use PIN.");
                setIsAuthenticating(false);
                return;
            }

            const auth = await LocalAuthentication.authenticateAsync({
                promptMessage: "Use Face ID / Touch ID to unlock",
                fallbackLabel: "Use PIN",
                cancelLabel: "Cancel",
                disableDeviceFallback: false,
            });

            if (auth.success) {
                router.replace('/home');
            } else {
                setError("Authentication failed. Please try again.");
            }
        } catch (error) {
            console.error("Authentication error:", error);
            setError("An error occurred during authentication.");
        } finally {
            setIsAuthenticating(false);
        }
    };

    return (
        <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="medical" size={80} color="white" />
                </View>
                <Text style={styles.title}>Kavindu_Rukshan</Text>
                <Text style={styles.subtitle}>Your medication reminder</Text>

                <View style={styles.card}>
                    <Text style={styles.welcomeText}>Welcome back!</Text>
                    <Text style={styles.instructionText}>
                        {hasBiometrics
                            ? "Use Face ID / Touch ID or enter PIN to access your medications..."
                            : "Enter your PIN to access your medications"}
                    </Text>

                    <TouchableOpacity
                        style={[styles.button, isAuthenticating && styles.buttonDisabled]}
                        onPress={authenticate}
                        disabled={isAuthenticating}
                    >
                        <Ionicons
                            name={hasBiometrics ? "finger-print-outline" : "keypad-outline"}
                            size={24}
                            color="white"
                            style={styles.buttonIcon}
                        />
                        <Text style={styles.buttonText}>
                            {isAuthenticating
                                ? "Verifying..."
                                : hasBiometrics
                                ? "Use Face ID / Touch ID"
                                : "Enter PIN"}
                        </Text>
                    </TouchableOpacity>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color={"#f44336"} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}
                </View>

                {/* Debugging Information */}
                <View style={styles.debugContainer}>
                    <Text style={styles.debugText}>Supported Types: {JSON.stringify(supportedTypes)}</Text>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    iconContainer: {
        width: 120,
        height: 120,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        margin: 20,
    },
    title: {
        fontWeight: "bold",
        color: "white",
        fontSize: 24,
        marginBottom: 10,
        textShadowColor: "rgba(0,0,0,0.2)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 18,
        color: "rgba(255,255,255,0.9)",
        marginBottom: 40,
        textAlign: "center",
    },
    card: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 30,
        width: width - 40,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3.84,
        shadowOpacity: 0.25,
        elevation: 5,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    instructionText: {
        fontSize: 16,
        marginBottom: 20,
        color: "#666",
        textAlign: "center",
    },
    button: {
        backgroundColor: "#4CAF50",
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 30,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    buttonIcon: {
        marginRight: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        padding: 10,
        backgroundColor: "#ffebee",
        borderRadius: 8,
    },
    errorText: {
        color: "#f44336",
        fontSize: 14,
        marginLeft: 8,
    },
    debugContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "rgba(0,0,0,0.1)",
        borderRadius: 10,
    },
    debugText: {
        color: "#333",
        fontSize: 12,
    },
});
