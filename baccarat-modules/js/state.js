// state.js - アプリケーション状態管理モジュール

const StateModule = (() => {
    // 初期状態の定義
    const initialState = {
        // 言語設定
        currentLanguage: 'ja',
        
        // ゲーム履歴
        history: [],
        
        // 資金管理
        bankroll: 100000,
        initialBankroll: 100000,
        bankrollHistory: [{ round: 0, amount: 100000 }],
        
        // ベット管理
        initialBetAmount: 500,
        betAmount: 500,
        activeBet: null,
        
        // パターン検証
        patternVerified: false,
        verificationCount: 0,
        requiredVerifications: 4,
        
        // マーチンゲール
        consecutiveLosses: 0,
        martingaleActive: false,
        
        // タイ処理
        tiePending: false,
        consecutiveTies: 0,
        lastNonTieRound: null,
        
        // UI状態
        selectedPlayerScore: null,
        selectedBankerScore: null,
        
        // セッション制御
        isPaused: false,
        sessionEnded: false,
        suspendBetting: false,
        
        // リスク管理
        lossLimitPercentage: 20,
        lossLimitAmount: 20000
    };

    // 現在の状態
    let currentState = { ...initialState };

    // 状態変更リスナー
    const stateListeners = [];

    return {
        // 状態の取得
        getState() {
            return { ...currentState };
        },

        // 特定の状態値の取得
        get(key) {
            return currentState[key];
        },

        // 状態の更新
        setState(updates) {
            const previousState = { ...currentState };
            currentState = { ...currentState, ...updates };
            
            // リスナーに変更を通知
            stateListeners.forEach(listener => {
                listener(currentState, previousState, updates);
            });
        },

        // 複数の状態を更新
        updateMultiple(updates) {
            this.setState(updates);
        },

        // 状態変更リスナーの追加
        addListener(listener) {
            stateListeners.push(listener);
        },

        // 状態変更リスナーの削除
        removeListener(listener) {
            const index = stateListeners.indexOf(listener);
            if (index > -1) {
                stateListeners.splice(index, 1);
            }
        },

        // 状態のリセット
        reset() {
            const newInitialState = {
                ...initialState,
                initialBankroll: currentState.initialBankroll,
                bankroll: currentState.initialBankroll,
                bankrollHistory: [{ round: 0, amount: currentState.initialBankroll }],
                lossLimitAmount: currentState.initialBankroll * (currentState.lossLimitPercentage / 100),
                currentLanguage: currentState.currentLanguage,
                requiredVerifications: currentState.requiredVerifications,
                lossLimitPercentage: currentState.lossLimitPercentage
            };
            
            currentState = newInitialState;
            
            // 全リスナーに通知
            stateListeners.forEach(listener => {
                listener(currentState, {}, { reset: true });
            });
        },

        // 計算値の取得
        getCalculatedValues() {
            const currentLoss = currentState.initialBankroll - currentState.bankroll;
            const lossPercentage = (currentLoss / currentState.initialBankroll * 100);
            const fundsRatio = (currentState.bankroll / currentState.initialBankroll * 100);
            
            return {
                currentLoss,
                lossPercentage,
                fundsRatio,
                isProfit: currentState.bankroll >= currentState.initialBankroll,
                profitLoss: currentState.bankroll - currentState.initialBankroll,
                profitPercent: ((currentState.bankroll / currentState.initialBankroll - 1) * 100)
            };
        },

        // ゲーム状態の取得
        getGameState() {
            const nonTieRounds = currentState.history.filter(r => r.winner !== 'tie');
            return {
                totalRounds: currentState.history.length,
                nonTieRounds: nonTieRounds.length,
                lastNonTieRound: nonTieRounds.length > 0 ? nonTieRounds[nonTieRounds.length - 1] : null,
                canMakeBet: !currentState.sessionEnded && !currentState.isPaused && !currentState.suspendBetting
            };
        },

        // デバッグ用：現在の状態をコンソールに出力
        debug() {
            console.table(currentState);
            return currentState;
        }
    };
})();

// グローバルスコープにエクスポート
window.AppState = StateModule;