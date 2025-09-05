// gameLogic.js - ゲームロジックモジュール

const GameLogicModule = (() => {
    const { t, determineWinner, getDifferenceType, filterNonTieResults } = window.UtilsModule;

    /**
     * ゲーム結果の計算
     */
    function calculateGameResult(playerScore, bankerScore) {
        const winner = determineWinner(playerScore, bankerScore);
        const diffType = getDifferenceType(playerScore, bankerScore);
        
        return {
            playerScore,
            bankerScore,
            winner,
            diffType,
            round: window.AppState.get('history').length + 1
        };
    }

    /**
     * パターン検証ロジック
     */
    function verifyPattern(history) {
        if (history.length < 2) {
            return { isVerified: false, reason: 'insufficient_data' };
        }

        const nonTieRounds = filterNonTieResults(history);
        if (nonTieRounds.length < 2) {
            return { isVerified: false, reason: 'insufficient_non_tie_data' };
        }

        const prevRound = nonTieRounds[nonTieRounds.length - 2];
        const currRound = nonTieRounds[nonTieRounds.length - 1];
        
        const prevWinner = prevRound.winner;
        const currWinner = currRound.winner;
        const diffType = prevRound.diffType;

        // パターンルール：
        // 偶数差の場合 → 勝者が交替することを期待
        // 奇数差の場合 → 勝者が継続することを期待
        if (diffType === t('even')) {
            return { 
                isVerified: prevWinner !== currWinner,
                reason: prevWinner !== currWinner ? 'even_alternation_confirmed' : 'even_alternation_failed'
            };
        } else if (diffType === t('odd')) {
            return { 
                isVerified: prevWinner === currWinner,
                reason: prevWinner === currWinner ? 'odd_continuation_confirmed' : 'odd_continuation_failed'
            };
        }

        return { isVerified: false, reason: 'unknown_pattern' };
    }

    /**
     * ベット提案の生成
     */
    function generateBetSuggestion() {
        const state = window.AppState.getState();
        const gameState = window.AppState.getGameState();
        
        // セッション終了やポーズ状態の確認
        if (state.sessionEnded) {
            return { 
                type: 'no_bet', 
                suggestion: t('sessionEnded'),
                reason: 'session_ended'
            };
        }
        
        if (state.isPaused) {
            return { 
                type: 'no_bet', 
                suggestion: t('paused'),
                reason: 'paused'
            };
        }
        
        if (state.suspendBetting) {
            return { 
                type: 'no_bet', 
                suggestion: t('tieOccurred'),
                reason: 'tie_occurred'
            };
        }

        // パターン未確認の場合
        if (!state.patternVerified) {
            return { 
                type: 'verification', 
                suggestion: `${t('patternVerifying')} (${state.verificationCount}/${state.requiredVerifications})`,
                reason: 'pattern_verification'
            };
        }

        // ベット提案の生成
        const nonTieRounds = filterNonTieResults(state.history);
        if (nonTieRounds.length < 1) {
            return { 
                type: 'no_bet', 
                suggestion: t('dataInsufficient'),
                reason: 'no_data'
            };
        }

        const lastRound = nonTieRounds[nonTieRounds.length - 1];
        const diffType = lastRound.diffType;
        const lastWinner = lastRound.winner;

        let suggestedBet;
        if (diffType === t('even')) {
            // 偶数差 → 交替パターン
            suggestedBet = lastWinner === t('player') ? t('banker') : t('player');
        } else if (diffType === t('odd')) {
            // 奇数差 → 継続パターン
            suggestedBet = lastWinner;
        } else {
            return { 
                type: 'no_bet', 
                suggestion: t('noBetSuggestion'),
                reason: 'pattern_unclear'
            };
        }

        const betStatus = state.martingaleActive ? t('martingaleContinue') : t('newBet');
        
        return {
            type: 'bet_suggestion',
            suggestion: `${betStatus}: ${suggestedBet} (¥${state.betAmount.toLocaleString()})`,
            target: suggestedBet,
            amount: state.betAmount,
            isMartingale: state.martingaleActive,
            reason: 'pattern_based'
        };
    }

    /**
     * タイ結果の処理
     */
    function handleTieResult(roundResult) {
        const state = window.AppState.getState();
        
        if (!state.tiePending) {
            // 初回タイ
            const updates = {
                tiePending: true,
                suspendBetting: true,
                consecutiveTies: 1
            };
            
            const nonTieHistory = filterNonTieResults(state.history);
            if (nonTieHistory.length > 0) {
                updates.lastNonTieRound = nonTieHistory[nonTieHistory.length - 1];
            }
            
            window.AppState.setState(updates);
        } else {
            // 連続タイ
            window.AppState.setState({
                consecutiveTies: state.consecutiveTies + 1
            });
        }

        // 履歴に追加
        const newHistory = [...state.history, roundResult];
        window.AppState.setState({ history: newHistory });
    }

    /**
     * 非タイ結果の処理
     */
    function handleNonTieResult(roundResult) {
        const state = window.AppState.getState();
        
        if (state.tiePending) {
            // タイ後の初回非タイ結果
            window.AppState.setState({
                tiePending: false,
                consecutiveTies: 0,
                suspendBetting: false
            });
        }
        
        const newHistory = [...state.history, roundResult];
        window.AppState.setState({ history: newHistory });
        
        // パターン検証の更新
        if (!state.patternVerified) {
            const verification = verifyPattern(newHistory);
            
            if (verification.isVerified) {
                const newVerificationCount = state.verificationCount + 1;
                
                if (newVerificationCount >= state.requiredVerifications) {
                    window.AppState.setState({
                        patternVerified: true,
                        verificationCount: newVerificationCount
                    });
                } else {
                    window.AppState.setState({
                        verificationCount: newVerificationCount
                    });
                }
            } else {
                window.AppState.setState({
                    verificationCount: 0
                });
            }
        }
        
        // アクティブベットの設定
        if (state.patternVerified && !state.suspendBetting && !state.sessionEnded && !state.isPaused) {
            const suggestion = generateBetSuggestion();
            if (suggestion.type === 'bet_suggestion') {
                window.AppState.setState({ activeBet: suggestion.target });
            }
        }
    }

    /**
     * ベット結果の適用
     */
    function applyBetResult(result) {
        const state = window.AppState.getState();
        const updates = {};
        
        if (result === 'win') {
            updates.bankroll = state.bankroll + state.betAmount;
            updates.betAmount = state.initialBetAmount;
            updates.consecutiveLosses = 0;
            updates.martingaleActive = false;
        } else if (result === 'lose') {
            updates.bankroll = state.bankroll - state.betAmount;
            updates.consecutiveLosses = state.consecutiveLosses + 1;
            updates.betAmount = state.betAmount * 2;
            updates.martingaleActive = true;
        }

        // 資金履歴の更新
        const newBankrollHistory = [...state.bankrollHistory, { 
            round: state.bankrollHistory.length, 
            amount: updates.bankroll 
        }];
        updates.bankrollHistory = newBankrollHistory;

        window.AppState.setState(updates);
        
        // リスク管理チェック
        window.RiskManagementModule?.checkRiskLimits();
    }

    /**
     * ゲームの初期化
     */
    function initializeGame() {
        // 初期状態のチェック
        const state = window.AppState.getState();
        
        // 損失限度額の計算
        const lossLimitAmount = state.initialBankroll * (state.lossLimitPercentage / 100);
        window.AppState.setState({ lossLimitAmount });
        
        console.log('Game initialized with settings:', {
            initialBankroll: state.initialBankroll,
            lossLimitPercentage: state.lossLimitPercentage,
            lossLimitAmount,
            requiredVerifications: state.requiredVerifications
        });
    }

    /**
     * ゲーム状態のリセット
     */
    function resetGame() {
        window.AppState.reset();
        console.log('Game state reset');
    }

    /**
     * デバッグ用：現在のゲーム状態を表示
     */
    function debugGameState() {
        const state = window.AppState.getState();
        const gameState = window.AppState.getGameState();
        const calculatedValues = window.AppState.getCalculatedValues();
        
        console.group('Game State Debug');
        console.log('Current State:', state);
        console.log('Game State:', gameState);
        console.log('Calculated Values:', calculatedValues);
        console.groupEnd();
        
        return { state, gameState, calculatedValues };
    }

    // 公開API
    return {
        calculateGameResult,
        verifyPattern,
        generateBetSuggestion,
        handleTieResult,
        handleNonTieResult,
        applyBetResult,
        initializeGame,
        resetGame,
        debugGameState
    };
})();

// グローバルスコープにエクスポート
window.GameLogicModule = GameLogicModule;