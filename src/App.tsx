import { useEffect, lazy, Suspense, useState, memo } from "react";
import { useStore } from "./store/useStore";
import {
  useUIStore,
  useBuilds,
  useActiveEnemy,
  useChartConfig,
  useBuildTabState,
  useEnemyTabState,
} from "./store/selectors";
import { shallow } from "zustand/shallow";
import { BuildForm } from "./components/BuildForm";
import { EnemyForm } from "./components/EnemyForm";
import { ChartControls } from "./components/ChartControls";
import { ImportDialog } from "./components/ImportDialog";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { SkillConfigForm } from "./components/SkillConfigForm";
import { SensitivityPanel } from "./components/SensitivityPanel";
import { Header } from "./components/Header";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Card, CardContent } from "./components/ui/card";
import { Trash2, Star, Plus, Download } from "lucide-react";
import { serializeState } from "./utils/urlState";
import { cn } from "./lib/utils";

const DamageChart = lazy(() =>
  import("./components/DamageChart").then((m) => ({ default: m.DamageChart }))
);
const DamageFormula = lazy(() =>
  import("./components/DamageFormula").then((m) => ({ default: m.DamageFormula }))
);

// ──────────────────────────────────────────────────────────────────────────────
// Sidebar: segmented switch between Build / Enemy / Skill
// ──────────────────────────────────────────────────────────────────────────────

type SidebarTab = "build" | "enemy" | "skill";

const Sidebar = memo(function Sidebar({
  combatType,
  isPvP,
}: {
  combatType: "melee" | "ranged" | "magic";
  isPvP: boolean;
}) {
  const [tab, setTab] = useState<SidebarTab>("build");
  const setShowImportDialog = useUIStore((s) => s.setShowImportDialog);
  const setShowEnemyImportDialog = useUIStore((s) => s.setShowEnemyImportDialog);
  const setShowClearConfirm = useUIStore((s) => s.setShowClearConfirm);

  return (
    <div className="space-y-3 overflow-y-auto pr-1">
      <div className="inline-flex w-full rounded-md border border-border/60 bg-muted/30 p-0.5">
        {(["build", "enemy", "skill"] as SidebarTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 px-3 py-1.5 text-xs font-medium rounded-sm capitalize transition-colors",
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "build" && (
        <BuildSidebar combatType={combatType} isPvP={isPvP} />
      )}
      {tab === "enemy" && (
        <EnemySidebar combatType={combatType} isPvP={isPvP} />
      )}
      {tab === "skill" && <SkillSidebar />}

      {tab === "build" && (
        <Button
          onClick={() => setShowClearConfirm(true)}
          variant="ghost"
          size="sm"
          className="w-full text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5 mr-2" />
          Clear all
        </Button>
      )}
      {(tab === "build" || tab === "enemy") && (
        <p className="text-[10px] text-muted-foreground/60 text-center">
          Tip: ⭐ marks your "current" build for the sensitivity panel
        </p>
      )}
    </div>
  );
});

const BuildSidebar = memo(function BuildSidebar({
  combatType,
  isPvP,
}: {
  combatType: "melee" | "ranged" | "magic";
  isPvP: boolean;
}) {
  const {
    builds,
    activeBuildTab,
    addBuild,
    updateBuild,
    updateBuildProperty,
    removeBuild,
    setActiveBuildTab,
  } = useBuildTabState() as any;

  const setShowImportDialog = useUIStore((s) => s.setShowImportDialog);
  const speedLimiter = useStore((s) => s.speedLimiter);
  const setSpeedLimiter = useStore((s) => s.setSpeedLimiter);
  const currentBuildIndex = useStore((s) => s.currentBuildIndex);
  const setCurrentBuild = useStore((s) => s.setCurrentBuild);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          onClick={() => setShowImportDialog(true)}
          size="sm"
          className="flex-1"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" /> Import
        </Button>
        <Button
          onClick={addBuild}
          size="sm"
          variant="outline"
          className="flex-1"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add
        </Button>
      </div>

      {builds.length > 0 && (
        <Tabs
          value={activeBuildTab}
          onValueChange={setActiveBuildTab}
          className="w-full"
        >
          <TabsList className="flex w-full overflow-x-auto overflow-y-hidden tabs-scrollable h-auto p-0.5 bg-muted/30 border border-border/60">
            {builds.map((build: any, index: number) => (
              <TabsTrigger
                key={index}
                value={index.toString()}
                className="text-xs flex-shrink-0 min-w-[100px] gap-1"
              >
                <span
                  role="button"
                  title={
                    currentBuildIndex === index
                      ? "Unmark as current"
                      : "Mark as current"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentBuild(index);
                  }}
                >
                  <Star
                    className={cn(
                      "h-3 w-3",
                      currentBuildIndex === index
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                </span>
                {build.name || `Build ${index + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>
          {builds.map((build: any, index: number) => (
            <TabsContent
              key={index}
              value={index.toString()}
              className="mt-3"
            >
              <BuildForm
                build={build}
                combatType={combatType}
                isPvP={isPvP}
                onChange={(updatedBuild) => updateBuild(index, updatedBuild)}
                onPropertyChange={(key, value) =>
                  updateBuildProperty(index, key, value)
                }
                onRemove={() => removeBuild(index)}
                speedLimiter={speedLimiter}
                onSpeedLimiterChange={setSpeedLimiter}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      {builds.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          No builds yet. Import or add one.
        </p>
      )}
    </div>
  );
});

const EnemySidebar = memo(function EnemySidebar({
  combatType,
  isPvP,
}: {
  combatType: "melee" | "ranged" | "magic";
  isPvP: boolean;
}) {
  const {
    enemies,
    activeEnemyTab,
    addEnemy,
    updateEnemy,
    updateEnemyProperty,
    removeEnemy,
    setActiveEnemyTab,
  } = useEnemyTabState() as any;
  const setShowEnemyImportDialog = useUIStore((s) => s.setShowEnemyImportDialog);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          onClick={() => setShowEnemyImportDialog(true)}
          size="sm"
          className="flex-1"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" /> Import
        </Button>
        <Button
          onClick={addEnemy}
          size="sm"
          variant="outline"
          className="flex-1"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add
        </Button>
      </div>

      {enemies.length > 0 && (
        <Tabs
          value={activeEnemyTab}
          onValueChange={setActiveEnemyTab}
          className="w-full"
        >
          <TabsList className="flex w-full overflow-x-auto overflow-y-hidden tabs-scrollable h-auto p-0.5 bg-muted/30 border border-border/60">
            {enemies.map((enemy: any, index: number) => (
              <TabsTrigger
                key={index}
                value={index.toString()}
                className="text-xs flex-shrink-0 min-w-[100px]"
              >
                {enemy.name || `Enemy ${index + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>
          {enemies.map((enemy: any, index: number) => (
            <TabsContent
              key={index}
              value={index.toString()}
              className="mt-3"
            >
              <EnemyForm
                enemy={enemy}
                combatType={combatType}
                isPvP={isPvP}
                onChange={(updatedEnemy) => updateEnemy(index, updatedEnemy)}
                onPropertyChange={(key, value) =>
                  updateEnemyProperty(index, key, value)
                }
                onRemove={() => removeEnemy(index)}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      {enemies.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          No enemies yet. Import or add one.
        </p>
      )}
    </div>
  );
});

const SkillSidebar = memo(function SkillSidebar() {
  const skillConfig = useStore((s) => s.skillConfig);
  const setSkillConfig = useStore((s) => s.setSkillConfig);
  return <SkillConfigForm config={skillConfig} onChange={setSkillConfig} />;
});

// ──────────────────────────────────────────────────────────────────────────────
// Main pane: chart + analysis tabs
// ──────────────────────────────────────────────────────────────────────────────

function App() {
  const uiState = useUIStore();
  const loadFromUrl = useStore((s) => s.loadFromUrl);
  const clearAll = useStore((s) => s.clearAll);

  const builds = useBuilds();
  const currentEnemy = useActiveEnemy();
  const chartConfig = useChartConfig() as any;
  const activeBuildTab = useStore((s) => s.activeBuildTab);
  const currentBuildIndex = useStore((s) => s.currentBuildIndex);

  const setXAxisStat = useStore((s) => s.setXAxisStat);
  const setXAxisRange = useStore((s) => s.setXAxisRange);
  const setYMetric = useStore((s) => s.setYMetric);
  const setCombatType = useStore((s) => s.setCombatType);
  const setIsPvP = useStore((s) => s.setIsPvP);

  const importBuild = useStore((s) => s.importBuild);
  const importEnemy = useStore((s) => s.importEnemy);
  const shareState = useStore((s) => s.shareState);

  const [analysisTab, setAnalysisTab] = useState<"sensitivity" | "formula">(
    "sensitivity"
  );

  // Load from URL hash on mount
  useEffect(() => {
    if (window.location.hash.length > 1) {
      const hash = window.location.hash.substring(1);
      loadFromUrl(hash);
    }
  }, []);

  // URL hash sync
  useEffect(() => {
    if (window.location.hash.length > 1) {
      const unsubscribe = useStore.subscribe(
        (state) => ({
          builds: state.builds,
          enemies: state.enemies,
          xAxisStat: state.xAxisStat,
          xAxisRange: state.xAxisRange,
          yMetric: state.yMetric,
          combatType: state.combatType,
          attackDirection: state.attackDirection,
          isPvP: state.isPvP,
          skillConfig: state.skillConfig,
          activeBuildTab: state.activeBuildTab,
          activeEnemyTab: state.activeEnemyTab,
        }),
        (currentState) => {
          const hash = serializeState(currentState);
          window.history.replaceState(null, "", `#${hash}`);
        },
        { equalityFn: shallow }
      );
      return () => unsubscribe();
    }
  }, []);

  // Tab validation only — no auto-combat-type-detection (user-controlled)
  useEffect(() => {
    const unsubscribe = useStore.subscribe(
      (state) => ({
        builds: state.builds,
        enemies: state.enemies,
        activeBuildTab: state.activeBuildTab,
        activeEnemyTab: state.activeEnemyTab,
        combatType: state.combatType,
      }),
      (current, previous) => {
        const { setActiveBuildTab, setActiveEnemyTab, setXAxisStat, selectSmartXAxisStat } =
          useStore.getState();

        const currentBuildTab = parseInt(current.activeBuildTab);
        if (
          current.builds.length === 0 ||
          currentBuildTab >= current.builds.length ||
          isNaN(currentBuildTab)
        ) {
          setActiveBuildTab("0");
        }

        const currentEnemyTab = parseInt(current.activeEnemyTab);
        if (
          current.enemies.length === 0 ||
          currentEnemyTab >= current.enemies.length ||
          isNaN(currentEnemyTab)
        ) {
          setActiveEnemyTab("0");
        }

        if (
          current.activeEnemyTab !== previous.activeEnemyTab ||
          current.enemies !== previous.enemies ||
          current.combatType !== previous.combatType
        ) {
          const enemyTabIndex = parseInt(current.activeEnemyTab);
          if (!isNaN(enemyTabIndex) && current.enemies[enemyTabIndex]) {
            const smartStat = selectSmartXAxisStat(
              current.enemies[enemyTabIndex],
              current.combatType
            );
            setXAxisStat(smartStat);
          }
        }
      },
      { equalityFn: shallow, fireImmediately: true }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        combatType={chartConfig.combatType}
        onCombatTypeChange={setCombatType}
        isPvP={chartConfig.isPvP}
        onIsPvPChange={setIsPvP}
        onShare={shareState}
      />

      <div className="container mx-auto px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <Sidebar
            combatType={chartConfig.combatType}
            isPvP={chartConfig.isPvP}
          />
        </aside>

        {/* Main pane */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-4">
          <Card>
            <CardContent className="pt-4 pb-3 space-y-3">
              <ChartControls
                xAxisStat={chartConfig.xAxisStat}
                onXAxisChange={setXAxisStat}
                xAxisRange={chartConfig.xAxisRange}
                onXAxisRangeChange={setXAxisRange}
                yMetric={chartConfig.yMetric}
                onYMetricChange={setYMetric}
                combatType={chartConfig.combatType}
                onCombatTypeChange={setCombatType}
              />
              <div className="min-h-[420px]">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm">
                      Loading chart…
                    </div>
                  }
                >
                  <DamageChart
                    builds={builds}
                    enemy={currentEnemy}
                    xAxisStat={chartConfig.xAxisStat}
                    xAxisRange={chartConfig.xAxisRange}
                    yMetric={chartConfig.yMetric}
                    combatType={chartConfig.combatType}
                    attackDirection="back"
                    isPvP={chartConfig.isPvP}
                    skillPotency={chartConfig.skillConfig.skillPotency}
                    skillFlatAdd={chartConfig.skillConfig.skillFlatAdd}
                    hitsPerCast={chartConfig.skillConfig.hitsPerCast}
                    weakenSkillPotency={chartConfig.skillConfig.weakenSkillPotency}
                    weakenSkillFlatAdd={chartConfig.skillConfig.weakenSkillFlatAdd}
                    cooldownTime={chartConfig.skillConfig.cooldownTime}
                    castTime={chartConfig.skillConfig.castTime}
                    skillCooldownSpecialization={
                      chartConfig.skillConfig.skillCooldownSpecialization
                    }
                    speedLimiter={chartConfig.speedLimiter}
                    monsterDamageBonus={
                      chartConfig.skillConfig.monsterDamageBonus || 0
                    }
                  />
                </Suspense>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <Tabs
                value={analysisTab}
                onValueChange={(v) => setAnalysisTab(v as any)}
              >
                <TabsList>
                  <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
                  <TabsTrigger value="formula">Formula</TabsTrigger>
                </TabsList>
                <TabsContent value="sensitivity" className="mt-4">
                  <SensitivityPanel
                    currentBuild={
                      currentBuildIndex !== null && builds[currentBuildIndex]
                        ? builds[currentBuildIndex]
                        : null
                    }
                    enemy={currentEnemy}
                    combatType={chartConfig.combatType}
                    speedLimiter={chartConfig.speedLimiter}
                    skillConfig={chartConfig.skillConfig}
                  />
                </TabsContent>
                <TabsContent value="formula" className="mt-4">
                  {builds.length > 0 && builds[parseInt(activeBuildTab)] ? (
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                          Loading formula…
                        </div>
                      }
                    >
                      <DamageFormula
                        build={builds[parseInt(activeBuildTab)]}
                        enemy={currentEnemy}
                        combatType={chartConfig.combatType}
                        attackDirection="back"
                        isPvP={chartConfig.isPvP}
                        skillPotency={chartConfig.skillConfig.skillPotency}
                        skillFlatAdd={chartConfig.skillConfig.skillFlatAdd}
                        hitsPerCast={chartConfig.skillConfig.hitsPerCast}
                        weakenSkillPotency={
                          chartConfig.skillConfig.weakenSkillPotency
                        }
                        weakenSkillFlatAdd={
                          chartConfig.skillConfig.weakenSkillFlatAdd
                        }
                        cooldownTime={chartConfig.skillConfig.cooldownTime}
                        castTime={chartConfig.skillConfig.castTime}
                        skillCooldownSpecialization={
                          chartConfig.skillConfig.skillCooldownSpecialization
                        }
                      />
                    </Suspense>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Select an active build to see the formula breakdown.
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>

      <footer className="border-t border-border bg-card/30 py-3 mt-6">
        <div className="container mx-auto text-center text-xs text-muted-foreground">
          Damage formulas based on research by{" "}
          <a
            href="https://www.reddit.com/r/throneandliberty/comments/1k2cgcp/how_does_our_stats_impact_our_skills_a_very_long/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            u/Rabubu29
          </a>
        </div>
      </footer>

      <ImportDialog
        isOpen={uiState.showImportDialog}
        onClose={() => uiState.setShowImportDialog(false)}
        onImportBuild={importBuild}
        onImportEnemy={importEnemy}
        mode="build"
      />

      <ImportDialog
        isOpen={uiState.showEnemyImportDialog}
        onClose={() => uiState.setShowEnemyImportDialog(false)}
        onImportBuild={importBuild}
        onImportEnemy={importEnemy}
        mode="enemy"
      />

      <ConfirmDialog
        isOpen={uiState.showClearConfirm}
        onClose={() => uiState.setShowClearConfirm(false)}
        onConfirm={clearAll}
        title="Clear All Data"
        description="This will remove all builds, reset the enemy configuration, and clear all chart settings. This action cannot be undone."
        confirmText="Clear All"
        confirmVariant="destructive"
      />

      {uiState.showShareNotification && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg animate-in slide-in-from-bottom-2 duration-300">
          URL copied to clipboard!
        </div>
      )}
    </div>
  );
}

export default App;
