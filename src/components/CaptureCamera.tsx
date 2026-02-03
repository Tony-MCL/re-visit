// ============================
// BLOCK: IMPORTS (START)
// ============================
import React, { useEffect, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { theme } from "../ui/theme";
import { t } from "../i18n/i18n";
// ============================
// BLOCK: IMPORTS (END)
// ============================

export default function CaptureCamera({
  isActive,
  camRef,
  onReadyChange,
  onPermissionChange,
  height = 360,
}: {
  isActive: boolean;
  camRef: React.RefObject<CameraView>;
  onReadyChange: (ready: boolean) => void;
  onPermissionChange: (granted: boolean) => void;
  height?: number;
}) {
  const [camPerm, requestCamPerm] = useCameraPermissions();

  const granted = useMemo(() => !!camPerm?.granted, [camPerm]);

  useEffect(() => {
    onPermissionChange(granted);
  }, [granted, onPermissionChange]);

  useEffect(() => {
    // Only request permission when the screen is active.
    // This avoids starting camera work in the background and prevents web preview hangs.
    if (!isActive) return;
    if (!camPerm) return;

    if (!camPerm.granted && camPerm.canAskAgain) {
      requestCamPerm().catch(() => {
        // noop (UI below handles the state)
      });
    }
  }, [isActive, camPerm, requestCamPerm]);

  return (
    <View style={{ height }}>
      {isActive && granted ? (
        <>
          <View style={{ flex: 1 }} pointerEvents="none">
            <CameraView
              ref={camRef}
              style={{ flex: 1 }}
              facing="back"
              onCameraReady={() => onReadyChange(true)}
            />
          </View>
        </>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ color: theme.text, fontWeight: "900" }}>
            {t("capture.cameraPerm")}
          </Text>

          {camPerm?.canAskAgain ? (
            <Pressable
              onPress={() => requestCamPerm()}
              style={{
                marginTop: 12,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ color: theme.text, fontWeight: "900" }}>
                {t("capture.enableCamera")}
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}
