// riskManagement.js - リスク管理モジュール

const RiskManagementModule = (() => {
    const { calculateRiskLevel, t } = window.UtilsModule;

    /**
     * リスクレベルのチェック
     */
    function checkRiskLimits() {
        const state = window.AppState.getState();
        const calculatedValues = window.AppState.getCalculatedValues();
        
        // 損失限度の確認
        if (calculatedValues.lossPercentage >= state.lossLimitPercentage && state.lossLimitPercentage > 0) {
            if (!state.sessionEnded) {
                endSession('loss_limit_reached');
            }
        }
        
        // リスクレベルの更新
        updateRiskLevel(calculatedValues.lossPercentage, state.lossLimitPercentage);
    }

    /**
     * リスクレベルの更新
     */
    function updateRiskLevel(lossPercentage, lossLimitPercentage) {
        const riskInfo = calculateRiskLevel(lossPercentage, lossLimitPercentage);
        
        // UIに反映
        const riskLevelElement = document.getElementById('riskLevel');
        if (riskLevelElement) {
            riskLevelElement.textContent = riskInfo.text;
            riskLevelElement.className = riskInfo.class;
        }
    }

    /**
     * セッションの一時停止
     */
    function pauseSession() {
        window.AppState.setState({ isPaused: true });
        
        // ポーズオーバーレイの表示
        const overlay = document.getElementById('pauseOverlay');
        if (overlay) {
            const content = overlay.querySelector('.pause-content');
            if (content) {
                content.innerHTML = `
                    <h2>⏸️ ${t('paused')}</h2>
                    <p>${t('pausedDescription')}</p>
                    <button class="resume-btn" id="resumeBtn">▶️ ${t('resume')}</button>
                `;
            }
            overlay.classList.remove('hidden');
        }
        
        console.log('Session paused by user');
    }

    /**
     * セッションの再開
     */
    function resumeSession() {
        window.AppState.setState({ isPaused: false });
        
        // ポーズオーバーレイの非表示
        const overlay = document.getElementById('pauseOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        
        console.log('Session resumed');
    }

    /**
     * セッションの終了
     */
    function endSession(reason = 'manual') {
        window.AppState.setState({ 
            sessionEnded: true, 
            suspendBetting: true, 
            activeBet: null 
        });
        
        // セッション終了オーバーレイの表示
        const overlay = document.getElementById('pauseOverlay');
        if (overlay) {
            const content = overlay.querySelector('.pause-content');
            if (content) {
                content.innerHTML = `
                    <h2>🛑 ${t('sessionEnded')}</h2>
                    <p>${t('sessionEndedDescription')}</p>
                    <button class="resume-btn" onclick="window.RiskManagementModule.startNewSession()">🔄 新しいセッション開始</button>
                `;
            }
            overlay.classList.remove('hidden');
        }
        
        console.log('Session ended:', reason);
    }

    /**
     * 新しいセッションの開始
     */
    function startNewSession() {
        window.GameLogicModule.resetGame();
        
        // オーバーレイの非表示
        const overlay = document.getElementById('pauseOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        
        console.log('New session started');
    }

    /**
     * 資金の妥当性チェック
     */
    function validateFunds(amount) {
        if (amount <= 0) {
            return { valid: false, message: '資金は0より大きい値である必要があります' };
        }
        
        if (amount < 1000) {
            return { valid: false, message: '最小資金は1,000円です' };
        }
        
        if (amount > 10000000) {
            return { valid: false, message: '最大資金は10,000,000円です' };
        }
        
        return { valid: true };
    }

    /**
     * 損失限度の妥当性チェック
     */
    function validateLossLimit(percentage) {
        if (percentage < 0 || percentage > 100) {
            return { valid: false, message: '損失限度は0-100%の範囲で設定してください' };
        }
        
        return { valid: true };
    }

    /**
     * ベット額の妥当性チェック
     */
    function validateBetAmount(amount, bankroll) {
        if (amount <= 0) {
            return { valid: false, message: 'ベット額は0より大きい値である必要があります' };
        }
        
        if (amount > bankroll) {
            return { valid: false, message: 'ベット額が資金を超えています' };
        }
        
        if (amount > bankroll * 0.1) {
            return { 
                valid: true, 
                warning: 'ベット額が資金の10%を超えています。リスクが高くなります。'
            };
        }
        
        return { valid: true };
    }

    /**
     * マーチンゲールの破綻リスク計算
     */
    function calculateMartingaleRisk(initialBet, bankroll, maxLosses = 10) {
        let currentBet = initialBet;
        let totalLoss = 0;
        let round = 0;
        
        const risks = [];
        
        while (round < maxLosses && totalLoss < bankroll) {
            totalLoss += currentBet;
            round++;
            
            risks.push({
                round,
                betAmount: currentBet,
                totalLoss,
                remainingFunds: bankroll - totalLoss,
                riskPercentage: (totalLoss / bankroll * 100)
            });
            
            currentBet *= 2;
        }
        
        return {
            maxConsecutiveLosses: round,
            totalRiskAmount: totalLoss,
            riskPercentage: (totalLoss / bankroll * 100),
            breakdown: risks
        };
    }

    /**
     * リアルタイムリスク監視
     */
    function monitorRisks() {
        const state = window.AppState.getState();
        const calculatedValues = window.AppState.getCalculatedValues();
        
        const risks = {
            lossRisk: calculatedValues.lossPercentage,
            martingaleRisk: state.martingaleActive,
            consecutiveLossRisk: state.consecutiveLosses,
            bankrollRisk: calculatedValues.fundsRatio
        };
        
        // 高リスク状態の警告
        const warnings = [];
        
        if (risks.lossRisk > state.lossLimitPercentage * 0.8) {
            warnings.push('損失限度に近づいています');
        }
        
        if (risks.consecutiveLossRisk >= 5) {
            warnings.push('連続敗北が続いています');
        }
        
        if (risks.bankrollRisk < 50) {
            warnings.push('資金が初期値の50%を下回りました');
        }
        
        if (state.betAmount > state.bankroll * 0.2) {
            warnings.push('ベット額が資金の20%を超えています');
        }
        
        return {
            risks,
            warnings,
            overallRisk: calculateOverallRisk(risks)
        };
    }

    /**
     * 総合リスクレベルの計算
     */
    function calculateOverallRisk(risks) {
        let riskScore = 0;
        
        // 各要素のリスクスコア計算
        riskScore += Math.min(risks.lossRisk, 100) * 0.4; // 損失リスク（重み40%）
        riskScore += risks.consecutiveLossRisk * 5; // 連続敗北リスク
        riskScore += Math.max(0, 100 - risks.bankrollRisk) * 0.3; // 資金減少リスク（重み30%）
        riskScore += risks.martingaleRisk ? 20 : 0; // マーチンゲールリスク
        
        // リスクレベルの決定
        if (riskScore >= 80) {
            return { level: 'critical', score: riskScore };
        } else if (riskScore >= 60) {
            return { level: 'high', score: riskScore };
        } else if (riskScore >= 40) {
            return { level: 'medium', score: riskScore };
        } else {
            return { level: 'low', score: riskScore };
        }
    }

    /**
     * 自動リスク制御
     */
    function autoRiskControl() {
        const riskMonitor = monitorRisks();
        
        // 自動一時停止条件
        if (riskMonitor.overallRisk.level === 'critical') {
            pauseSession();
            return true;
        }
        
        return false;
    }

    // 定期的なリスク監視の設定
    let riskMonitorInterval = null;
    
    function startRiskMonitoring(interval = 5000) {
        if (riskMonitorInterval) {
            clearInterval(riskMonitorInterval);
        }
        
        riskMonitorInterval = setInterval(() => {
            const state = window.AppState.getState();
            if (!state.sessionEnded && !state.isPaused) {
                autoRiskControl();
            }
        }, interval);
    }
    
    function stopRiskMonitoring() {
        if (riskMonitorInterval) {
            clearInterval(riskMonitorInterval);
            riskMonitorInterval = null;
        }
    }

    // 公開API
    return {
        checkRiskLimits,
        updateRiskLevel,
        pauseSession,
        resumeSession,
        endSession,
        startNewSession,
        validateFunds,
        validateLossLimit,
        validateBetAmount,
        calculateMartingaleRisk,
        monitorRisks,
        calculateOverallRisk,
        autoRiskControl,
        startRiskMonitoring,
        stopRiskMonitoring
    };
})();

// グローバルスコープにエクスポート
window.RiskManagementModule = RiskManagementModule;