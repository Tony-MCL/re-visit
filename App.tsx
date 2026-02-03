import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

import CaptureScreen from "./src/screens/CaptureScreen";
import LogScreen from "./src/screens/LogScreen";
import { theme } from "./src/ui/theme";
import { initI18n, getLang, setLang, t } from "./src/i18n/i18n";
import Splash from "./src/components/Splash";
import type { ProfileId } from "./src/types/entry";

import PaywallModal from "./src/components/PaywallModal";
import { getPlan, setPlan, type Plan } from "./src/entitlements/plan";

type Tab = "capture" | "log";

const PROFILE_KEY = "revisit.profile.v1";

export default function App() {
  const [tab, setTab] = useState<Tab>("capture");
  const [lang, setLangState] = useState<"no" | "en">("no");
  const [ready, setReady] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [activeProfile, setActiveProfile] = useState<ProfileId>("private");

  // plan (free/pro)
  const [plan, setPlanState] = useState<Plan>("free");

  // paywall modal (for profile lock)
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    (async () => {
      await initI18n();
      setLangState(getLang());

      const storedPlan = await getPlan();
      setPlanState(storedPlan);

      const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);
      if (storedProfile === "private" || storedProfile === "work") {
        // If plan is free and stored profile is "work", force back to private.
        if (storedPlan === "free" && storedProfile === "work") {
          setActiveProfile("private");
          await AsyncStorage.setItem(PROFILE_KEY, "private");
        } else {
          setActiveProfile(storedProfile);
        }
      }

      setReady(true);

      setShowSplash(true);
      window.setTimeout(() => setShowSplash(false), 1600);
    })();
  }, []);

  // If plan flips to free while user is on work, force back to private.
  useEffect(() => {
    (async () => {
      if (plan === "free" && activeProfile === "work") {
        setActiveProfile("private");
        await AsyncStorage.setItem(PROFILE_KEY, "private");
      }
    })();
  }, [plan, activeProfile]);

  const headerTitle = useMemo(() => {
    return tab === "capture" ? t("app.title") : t("log.title");
  }, [tab, lang]);

  const chooseLang = async (next: "no" | "en") => {
    await setLang(next);
    setLangState(next);
  };

  const setProfile = async (p: ProfileId) => {
    // Gate work profile behind Pro
    if (p === "work" && plan === "free") {
      setPaywallOpen(true);
      return;
    }

    setActiveProfile(p);
    await AsyncStorage.setItem(PROFILE_KEY, p);
  };

  const setPlanAndPersist = async (next: Plan) => {
    await setPlan(next);
    setPlanState(next);

    // If switching to free, we also ensure profile is private
    if (next === "free" && activeProfile === "work") {
      setActiveProfile("private");
      await AsyncStorage.setItem(PROFILE_KEY, "private");
    }
  };

  if (!ready) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <StatusBar style="light" />
        <Splash />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style="light" />

      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text
            style={{
              color: theme.text,
              fontSize: 20,
              fontWeight: "700",
              flex: 1,
            }}
          >
            {headerTitle}
          </Text>

          {/* Profile toggle */}
          <View
            style={{
              flexDirection: "row",
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.surface,
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <ProfilePill
              active={activeProfile === "private"}
              label={t("app.profiles.private")}
              onPress={() => setProfile("private")}
              showLock={false}
            />

            {/* Work: lock icon if free */}
            <ProfilePill
              active={activeProfile === "work"}
              label={t("app.profiles.work")}
              onPress={() => setProfile("work")}
              showLock={plan === "free"}
            />
          </View>

          {/* Hamburger */}
          <Pressable
            onPress={() => setMenuOpen(true)}
            style={{
              width: 40,
              height: 36,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: theme.text, fontWeight: "900", fontSize: 18 }}>
              ☰
            </Text>
          </Pressable>
        </View>

        <Text style={{ color: theme.muted, marginTop: 6 }}>{t("app.subtitle")}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, display: tab === "capture" ? "flex" : "none" }}>
          <CaptureScreen isActive={tab === "capture"} activeProfile={activeProfile} />
        </View>

        <View style={{ flex: 1, display: tab === "log" ? "flex" : "none" }}>
          <LogScreen isActive={tab === "log"} activeProfile={activeProfile} />
        </View>
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
          {t("app.tabs.capture")}
        </TabButton>
        <TabButton active={tab === "log"} onPress={() => setTab("log")}>
          {t("app.tabs.log")}
        </TabButton>
      </View>

      {/* Hamburger menu */}
      <Modal
        transparent
        visible={menuOpen}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          onPress={() => setMenuOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            padding: 16,
            justifyContent: "flex-start",
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              alignSelf: "flex-end",
              width: 280,
              backgroundColor: theme.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 14,
            }}
          >
            <Text style={{ color: theme.text, fontWeight: "900", fontSize: 16 }}>
              {t("app.menu.title")}
            </Text>

            <View style={{ height: 12 }} />

            <Text style={{ color: theme.muted, fontWeight: "800" }}>
              {t("language.label")}
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <MenuChoice
                label={t("language.no")}
                active={lang === "no"}
                onPress={() => chooseLang("no")}
              />
              <MenuChoice
                label={t("language.en")}
                active={lang === "en"}
                onPress={() => chooseLang("en")}
              />
            </View>

            {/* DEV: plan toggle */}
            <View style={{ height: 16 }} />
            <Text style={{ color: theme.muted, fontWeight: "800" }}>
              {t("dev.title")}
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <MenuChoice
                label={t("dev.setFree")}
                active={plan === "free"}
                onPress={() => setPlanAndPersist("free")}
              />
              <MenuChoice
                label={t("dev.setPro")}
                active={plan === "pro"}
                onPress={() => setPlanAndPersist("pro")}
              />
            </View>

            <View style={{ height: 12 }} />

            <Pressable
              onPress={() => setMenuOpen(false)}
              style={{
                marginTop: 6,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.text, fontWeight: "900" }}>OK</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Paywall for locked Work profile */}
      <PaywallModal
        visible={paywallOpen}
        title={t("capture.lockedProfileTitle")}
        message={t("capture.lockedProfileMsg")}
        primaryLabel={t("paywall.primary")}
        secondaryLabel={t("paywall.secondary")}
        onPrimary={() => setPaywallOpen(false)} // later: open pricing screen
        onSecondary={() => setPaywallOpen(false)}
        onClose={() => setPaywallOpen(false)}
      />

      {/* Splash overlay */}
      {showSplash ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          <Splash />
        </View>
      ) : null}
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

function MenuChoice({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: active ? 2 : 1,
        borderColor: active ? theme.accent : theme.border,
        backgroundColor: active ? theme.surface : "transparent",
        alignItems: "center",
      }}
    >
      <Text style={{ color: active ? theme.text : theme.muted, fontWeight: "900" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function ProfilePill({
  active,
  label,
  onPress,
  showLock,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  showLock?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 7,
        backgroundColor: active ? theme.card : "transparent",
        borderRightWidth: 1,
        borderRightColor: theme.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        opacity: showLock ? 0.8 : 1,
      }}
    >
      <Text style={{ color: active ? theme.text : theme.muted, fontWeight: "900" }}>
        {label}
      </Text>
      {showLock ? <Text style={{ fontWeight: "900" }}>🔒</Text> : null}
    </Pressable>
  );
}
