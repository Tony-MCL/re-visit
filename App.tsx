import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Text, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import CaptureScreen from "./src/screens/CaptureScreen";
import LogScreen from "./src/screens/LogScreen";
import { theme } from "./src/ui/theme";

type Tab = "capture" | "log";

export default function App() {
  const [tab, setTab] = useState<Tab>("capture");

  const headerTitle = useMemo(() => {
    return tab === "capture" ? "Re:visit?" : "Logg";
  }, [tab]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style="light" />
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 }}>
        <Text style={{ color: theme.text, fontSize: 20, fontWeight: "700" }}>
          {headerTitle}
        </Text>
        <Text style={{ color: theme.muted, marginTop: 6 }}>
          Én opplevelse. Én sannhet.
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        {tab === "capture" ? <CaptureScreen /> : <LogScreen />}
      </View>

      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: theme.border,
          backgroundColor: theme.surface,
        }}
      >
        <TabButton active={tab === "capture"} onPress={() => setTab("capture")}>
          Fang
        </TabButton>
        <TabButton active={tab === "log"} onPress={() => setTab("log")}>
          Logg
        </TabButton>
      </View>
    </SafeAreaView>
  );
}

function TabButton({
  active,
  onPress,
  children,
}: {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: active ? theme.text : theme.muted,
          fontWeight: active ? "700" : "600",
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
