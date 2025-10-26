import { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Image,
    TextInput,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { uploadPhotoToNotion } from "../lib/notion";
import { saveLastPhotoTime } from "../lib/storage";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";

export default function HomeScreen() {
    const [permission, requestPermission] = useCameraPermissions();

    const [facing, setFacing] = useState<CameraType>("back");
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [caption, setCaption] = useState<string>("");

    const cameraRef = useRef<CameraView>(null);

    const router = useRouter();

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need camera permission</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={requestPermission}
                >
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (!cameraRef.current) return;

        let photo = await cameraRef.current.takePictureAsync({
            mirror: false,
        });
        // TODO(michaelfromyeg): this is a terrible hack; make it correct
        if (photo) {
            if (facing === "front") {
                photo = (await manipulateAsync(
                    photo.uri,
                    [{ flip: FlipType.Horizontal }],
                    { compress: 1, format: SaveFormat.JPEG },
                )) as any;
            }
            setCapturedPhoto(photo.uri);
        }
    };

    const uploadPhoto = async () => {
        if (!capturedPhoto) return;

        setIsUploading(true);
        try {
            await uploadPhotoToNotion(capturedPhoto, caption);
            await saveLastPhotoTime(Date.now());
            Alert.alert("Success!", "Photo uploaded to Notion");
            setCapturedPhoto(null);
            setCaption("");
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to upload photo");
        } finally {
            setIsUploading(false);
        }
    };

    const toggleCameraFacing = () => {
        setFacing((current) => (current === "back" ? "front" : "back"));
    };

    if (capturedPhoto) {
        return (
            <View style={styles.container}>
                <Image
                    source={{ uri: capturedPhoto }}
                    style={[
                        styles.preview,
                        // facing === "front" && styles.mirrorPreview, // Add conditional mirror style
                    ]}
                />
                <TextInput
                    style={styles.captionInput}
                    placeholder="Add a caption..."
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            setCapturedPhoto(null);
                            setCaption(""); // Clear caption on retake
                        }}
                        disabled={isUploading}
                    >
                        <Text style={styles.buttonText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={uploadPhoto}
                        disabled={isUploading}
                    >
                        <Text style={styles.buttonText}>
                            {isUploading ? "Uploading..." : "Upload to Notion"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <View style={styles.overlay}>
                    <View style={styles.topButtons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.push("/settings")}
                        >
                            <Text style={styles.iconText}>⚙️</Text>
                        </TouchableOpacity>
                        {/*<TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.push("/history")}
                        >
                            <Text style={styles.iconText}>📚</Text>
                        </TouchableOpacity>*/}
                    </View>

                    <View style={styles.bottomButtons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={toggleCameraFacing}
                        >
                            <Text style={styles.iconText}>🔄</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={takePicture}
                        >
                            <View style={styles.captureButtonInner} />
                        </TouchableOpacity>
                        <View style={styles.iconButton} />
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: "transparent",
        justifyContent: "space-between",
    },
    topButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 20,
        paddingTop: 60,
    },
    bottomButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingBottom: 40,
    },
    iconButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    iconText: {
        fontSize: 24,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: "rgba(0,0,0,0.5)",
    },
    captureButtonInner: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: "white",
    },
    preview: {
        flex: 1,
    },
    buttonContainer: {
        flexDirection: "row",
        padding: 20,
        gap: 10,
    },
    button: {
        flex: 1,
        backgroundColor: "#666",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    primaryButton: {
        backgroundColor: "#007AFF",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    message: {
        textAlign: "center",
        paddingBottom: 10,
    },
    captionInput: {
        backgroundColor: "white",
        padding: 15,
        margin: 20,
        marginTop: 0,
        borderRadius: 8,
        fontSize: 16,
        minHeight: 60,
    },
    mirrorPreview: {
        transform: [{ scaleX: -1 }],
    },
});
