// app.js - メインアプリケーション初期化モジュール

const BaccaratApp = (() => {
    
    /**
     * アプリケーションの初期化
     */
    function initializeApp() {
        console.log('Initializing Baccarat Strategy Advisor...');
        
        try {
            // 1. 依存モジュールの確認
            checkModuleDependencies();
            
            // 2. コンポーネントの生成
            window.ComponentsModule.initializeComponents();
            
            // 3. 状態管理リスナーの設定
            setupStateListeners();
            
            // 4. イベントリスナーの設定
            window.UIModule.setupEventListeners();
            
            // 5. ゲームの初期化
            window.GameLogicModule.initializeGame();
            
            // 6. リスク監視の開始
            window.RiskManagementModule.startRiskMonitoring();
            
            // 7. UI の初期表示
            window.UIModule.updateLanguageUI();
            window.UIModule.updateUI();
            
            // 8. サービスワーカーの登録
            registerServiceWorker();
            
            console.log('Baccarat Strategy Advisor initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            showErrorMessage('アプリケーションの初期化に失敗しました');
        }
    }

    /**
     * 依存モジュールの確認
     */
    function checkModuleDependencies() {
        const requiredModules = [
            'TranslationModule',
            'AppState',
            'UtilsModule',
            'ComponentsModule',
            'GameLogicModule',
            'RiskManagementModule',
            'UIModule'
        ];

        const missingModules = requiredModules.filter(module => !window[module]);
        
        if (missingModules.length > 0) {
            throw new Error(`Missing required modules: ${missingModules.join(', ')}`);
        }
        
        console.log('All required modules loaded successfully');
    }

    /**
     * 状態変更リスナーの設定
     */
    function setupStateListeners() {
        window.AppState.addListener((newState, previousState, changes) => {
            // 言語変更時の処理
            if (changes.currentLanguage) {
                window.UIModule.updateLanguageUI();
            }
            
            // 資金変更時の処理
            if (changes.bankroll !== undefined || changes.betAmount !== undefined) {
                window.UIModule.updateFundsDisplay();
                window.UIModule.updateRiskDisplay();
            }
            
            // リスク関連の変更時の処理
            if (changes.lossLimitPercentage !== undefined || changes.lossLimitAmount !== undefined) {
                window.UIModule.updateRiskDisplay();
                window.RiskManagementModule.checkRiskLimits();
            }
            
            // ゲーム状態変更時の処理
            if (changes.history !== undefined || 
                changes.patternVerified !== undefined || 
                changes.martingaleActive !== undefined ||
                changes.consecutiveTies !== undefined) {
                window.UIModule.updateStatusDisplay();
                window.UIModule.updateSuggestionDisplay();
                window.UIModule.updateHistoryDisplay();
            }
            
            // チャート更新が必要な変更
            if (changes.bankrollHistory !== undefined) {
                window.UIModule.updateChart();
            }
            
            // リセット時の処理
            if (changes.reset) {
                window.UIModule.clearScoreSelections();
                window.UIModule.updateUI();
            }
        });
        
        console.log('State listeners configured');
    }

    /**
     * エラーメッセージの表示
     */
    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(239, 68, 68, 0.95);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        `;
        errorDiv.innerHTML = `
            <h3 style="margin: 0 0 15px 0;">エラー</h3>
            <p style="margin: 0 0 20px 0;">${message}</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #ef4444;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
            ">再読み込み</button>
        `;
        document.body.appendChild(errorDiv);
    }

    /**
     * サービスワーカーの登録（PWA対応）
     */
    async function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const serviceWorkerCode = `
                    const CACHE_NAME = 'baccarat-advisor-v1';
                    const urlsToCache = [
                        '/',
                        '/index.html'
                    ];

                    self.addEventListener('install', event => {
                        event.waitUntil(
                            caches.open(CACHE_NAME)
                                .then(cache => cache.addAll(urlsToCache))
                        );
                    });

                    self.addEventListener('fetch', event => {
                        event.respondWith(
                            caches.match(event.request)
                                .then(response => {
                                    return response || fetch(event.request);
                                })
                        );
                    });
                `;

                const blob = new Blob([serviceWorkerCode], { type: 'application/javascript' });
                const swUrl = URL.createObjectURL(blob);
                
                await navigator.serviceWorker.register(swUrl);
                console.log('Service Worker registered successfully');
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }

    /**
     * アプリケーションの状態を保存（メモリベース）
     */
    function saveAppState() {
        try {
            const state = window.AppState.getState();
            const saveData = {
                currentLanguage: state.currentLanguage,
                initialBankroll: state.initialBankroll,
                lossLimitPercentage: state.lossLimitPercentage,
                requiredVerifications: state.requiredVerifications,
                // セッション情報は保存しない（セキュリティ上の理由）
            };
            
            window.UtilsModule.saveToStorage('baccaratAppSettings', saveData);
            console.log('App settings saved');
        } catch (error) {
            console.warn('Failed to save app settings:', error);
        }
    }

    /**
     * アプリケーションの状態を読み込み
     */
    function loadAppState() {
        try {
            const savedSettings = window.UtilsModule.loadFromStorage('baccaratAppSettings');
            
            if (savedSettings) {
                window.AppState.setState({
                    currentLanguage: savedSettings.currentLanguage || 'ja',
                    initialBankroll: savedSettings.initialBankroll || 100000,
                    lossLimitPercentage: savedSettings.lossLimitPercentage || 20,
                    requiredVerifications: savedSettings.requiredVerifications || 4
                });
                console.log('App settings loaded');
            }
        } catch (error) {
            console.warn('Failed to load app settings:', error);
        }
    }

    /**
     * アプリケーションの終了処理
     */
    function cleanupApp() {
        // リスク監視の停止
        window.RiskManagementModule?.stopRiskMonitoring();
        
        // 設定の保存
        saveAppState();
        
        console.log('App cleanup completed');
    }

    /**
     * デバッグモードの切り替え
     */
    function toggleDebugMode() {
        if (window.debugMode) {
            window.debugMode = false;
            console.log('Debug mode disabled');
        } else {
            window.debugMode = true;
            console.log('Debug mode enabled');
            
            // デバッグ情報を表示
            window.GameLogicModule.debugGameState();
        }
    }

    /**
     * アプリケーションのバージョン情報
     */
    function getVersionInfo() {
        return {
            name: 'Baccarat Strategy Advisor',
            version: '1.0.0',
            buildDate: new Date().toISOString(),
            modules: [
                'TranslationModule',
                'AppState',
                'UtilsModule', 
                'ComponentsModule',
                'GameLogicModule',
                'RiskManagementModule',
                'UIModule'
            ]
        };
    }

    // ページの読み込み完了時に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadAppState();
            initializeApp();
        });
    } else {
        loadAppState();
        initializeApp();
    }

    // ページ離脱時のクリーンアップ
    window.addEventListener('beforeunload', cleanupApp);

    // グローバルデバッグコマンド
    window.toggleDebugMode = toggleDebugMode;

    // 公開API
    return {
        initializeApp,
        saveAppState,
        loadAppState,
        cleanupApp,
        toggleDebugMode,
        getVersionInfo,
        
        // 開発用ヘルパー
        dev: {
            getState: () => window.AppState.getState(),
            resetState: () => window.GameLogicModule.resetGame(),
            debugGame: () => window.GameLogicModule.debugGameState(),
            monitorRisk: () => window.RiskManagementModule.monitorRisks(),
            version: getVersionInfo()
        }
    };
})();

// グローバルスコープにエクスポート
window.BaccaratApp = BaccaratApp;

// コンソールにバージョン情報を表示
console.log('🎯 Baccarat Strategy Advisor v1.0.0 - Modular Architecture');
console.log('Type "toggleDebugMode()" to enable debug mode');
console.log('Access "BaccaratApp.dev" for development helpers');