// ui.js - UI更新とイベント処理モジュール

const UIModule = (() => {
    const { 
        formatCurrency, t, getWinnerClass, toggleVisibility, setText, setHTML,
        addClass, removeClass, setClass, addEventListenerSafe
    } = window.UtilsModule;

    /**
     * UI全体の更新
     */
    function updateUI() {
        updateFundsDisplay();
        updateRiskDisplay();
        updateStatusDisplay();
        updateSuggestionDisplay();
        updateHistoryDisplay();
        updateChart();
    }

    /**
     * 資金表示の更新
     */
    function updateFundsDisplay() {
        const state = window.AppState.getState();
        setText('fundsAmount', `¥${state.bankroll.toLocaleString()}`);
        setText('currentBetAmount', `¥${state.betAmount.toLocaleString()}`);
    }

    /**
     * リスク表示の更新
     */
    function updateRiskDisplay() {
        const state = window.AppState.getState();
        const calculatedValues = window.AppState.getCalculatedValues();
        
        // 資金比率
        setText('fundsRatio', calculatedValues.fundsRatio.toFixed(1) + '%');
        
        // 現在の損失
        const lossText = calculatedValues.currentLoss >= 0 ? 
            `¥${calculatedValues.currentLoss.toLocaleString()}` : 
            `+¥${Math.abs(calculatedValues.currentLoss).toLocaleString()}`;
        setText('currentLoss', lossText);
        
        const currentLossElement = document.getElementById('currentLoss');
        if (currentLossElement) {
            currentLossElement.style.color = calculatedValues.currentLoss >= 0 ? '#ef4444' : '#10b981';
        }
        
        // 損失限度表示
        const lossLimitFormatted = formatCurrency(state.lossLimitAmount);
        setText('lossLimitDisplay', `${lossLimitFormatted} (${state.lossLimitPercentage}%)`);
    }

    /**
     * ステータス表示の更新
     */
    function updateStatusDisplay() {
        const state = window.AppState.getState();
        
        // 検証ステータス
        updateVerificationStatus(state);
        
        // マーチンゲールステータス
        updateMartingaleStatus(state);
        
        // タイステータス
        updateTieStatus(state);
        
        // 連続敗北
        setText('consecutiveLossesCount', state.consecutiveLosses + t('times'));
    }

    /**
     * 検証ステータスの更新
     */
    function updateVerificationStatus(state) {
        const statusElement = document.getElementById('verificationStatus');
        if (statusElement) {
            if (state.patternVerified) {
                statusElement.textContent = t('patternVerified');
                statusElement.className = 'status-badge status-verified';
            } else {
                statusElement.textContent = `${t('patternVerifying')} (${state.verificationCount}/${state.requiredVerifications})`;
                statusElement.className = 'status-badge status-verifying';
            }
        }
    }

    /**
     * マーチンゲールステータスの更新
     */
    function updateMartingaleStatus(state) {
        const statusElement = document.getElementById('martingaleStatus');
        if (statusElement) {
            if (state.martingaleActive) {
                statusElement.textContent = t('active');
                statusElement.className = 'status-badge status-active';
            } else {
                statusElement.textContent = t('inactive');
                statusElement.className = 'status-badge status-inactive';
            }
        }
    }

    /**
     * タイステータスの更新
     */
    function updateTieStatus(state) {
        const tieItem = document.getElementById('tieStatusItem');
        const tieValue = document.getElementById('tieStatusValue');
        
        if (state.consecutiveTies > 0) {
            toggleVisibility('tieStatusItem', true);
            if (tieValue) {
                tieValue.textContent = state.consecutiveTies + t('consecutiveTie');
            }
        } else {
            toggleVisibility('tieStatusItem', false);
        }
    }

    /**
     * 提案表示の更新
     */
    function updateSuggestionDisplay() {
        const suggestion = window.GameLogicModule.generateBetSuggestion();
        setText('suggestionText', suggestion.suggestion);
    }

    /**
     * 履歴表示の更新
     */
    function updateHistoryDisplay() {
        const state = window.AppState.getState();
        const container = document.getElementById('historyContainer');
        
        if (!container) return;
        
        if (state.history.length === 0) {
            container.innerHTML = `<div class="history-empty">${t('noHistoryYet')}</div>`;
        } else {
            const historyHTML = state.history.slice().reverse().map((result, index) => 
                window.ComponentsModule.createHistoryItem(result, index, state.history.length)
            ).join('');
            container.innerHTML = historyHTML;
        }
    }

    /**
     * チャートの更新
     */
    function updateChart() {
        const state = window.AppState.getState();
        const canvas = document.getElementById('fundsChart');
        const placeholder = document.getElementById('chartPlaceholder');
        
        if (!canvas || !placeholder) return;
        
        if (state.bankrollHistory.length <= 1) {
            placeholder.style.display = 'block';
            canvas.style.display = 'none';
            return;
        }
        
        placeholder.style.display = 'none';
        canvas.style.display = 'block';
        
        drawChart(canvas, state.bankrollHistory, state.initialBankroll, state.lossLimitAmount);
    }

    /**
     * チャート描画
     */
    function drawChart(canvas, bankrollHistory, initialBankroll, lossLimitAmount) {
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        const padding = 60;
        const chartWidth = rect.width - 2 * padding;
        const chartHeight = rect.height - 2 * padding;
        
        // データ範囲の計算
        const amounts = bankrollHistory.map(h => h.amount);
        const minAmount = Math.min(...amounts);
        const maxAmount = Math.max(...amounts);
        const amountRange = Math.max(maxAmount - minAmount, maxAmount * 0.1);
        
        const adjustedMin = minAmount - amountRange * 0.1;
        const adjustedMax = maxAmount + amountRange * 0.1;
        const adjustedRange = adjustedMax - adjustedMin;
        
        // 背景をクリア
        ctx.fillStyle = 'rgba(55, 65, 81, 0.8)';
        ctx.fillRect(0, 0, rect.width, rect.height);
        
        // グリッドとラベル
        drawChartGrid(ctx, padding, chartWidth, chartHeight, adjustedMin, adjustedMax, adjustedRange);
        
        // データライン
        drawChartLine(ctx, padding, chartWidth, chartHeight, bankrollHistory, adjustedMin, adjustedRange, initialBankroll);
        
        // 基準線（初期資金）
        drawReferenceLine(ctx, padding, chartWidth, chartHeight, initialBankroll, adjustedMin, adjustedRange, '初期資金');
        
        // 損失限度線
        if (lossLimitAmount > 0) {
            const lossLimitValue = initialBankroll - lossLimitAmount;
            drawReferenceLine(ctx, padding, chartWidth, chartHeight, lossLimitValue, adjustedMin, adjustedRange, '損失限度', '#ef4444');
        }
    }

    /**
     * チャートグリッドの描画
     */
    function drawChartGrid(ctx, padding, chartWidth, chartHeight, adjustedMin, adjustedMax, adjustedRange) {
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 1;
        
        const ySteps = 6;
        for (let i = 0; i <= ySteps; i++) {
            const y = padding + (chartHeight * i / ySteps);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
            
            const value = adjustedMax - (adjustedRange * i / ySteps);
            ctx.fillStyle = '#9ca3af';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            
            let labelText;
            if (value >= 1000000) {
                labelText = (value / 1000000).toFixed(value >= 10000000 ? 0 : 1) + 'M';
            } else if (value >= 10000) {
                labelText = (value / 1000).toFixed(value >= 100000 ? 0 : 0) + 'k';
            } else {
                labelText = Math.round(value).toLocaleString();
            }
            
            ctx.fillText('¥' + labelText, padding - 8, y);
        }
    }

    /**
     * チャートラインの描画
     */
    function drawChartLine(ctx, padding, chartWidth, chartHeight, bankrollHistory, adjustedMin, adjustedRange, initialBankroll) {
        if (bankrollHistory.length <= 1) return;
        
        const currentAmount = bankrollHistory[bankrollHistory.length - 1].amount;
        const isProfit = currentAmount >= initialBankroll;
        
        ctx.strokeStyle = isProfit ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        
        for (let i = 0; i < bankrollHistory.length; i++) {
            const x = padding + (chartWidth * i / (bankrollHistory.length - 1));
            const normalizedAmount = (bankrollHistory[i].amount - adjustedMin) / adjustedRange;
            const y = padding + chartHeight - (normalizedAmount * chartHeight);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // データポイント
        ctx.fillStyle = isProfit ? '#10b981' : '#ef4444';
        for (let i = 0; i < bankrollHistory.length; i++) {
            const x = padding + (chartWidth * i / (bankrollHistory.length - 1));
            const normalizedAmount = (bankrollHistory[i].amount - adjustedMin) / adjustedRange;
            const y = padding + chartHeight - (normalizedAmount * chartHeight);
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            if (i === bankrollHistory.length - 1) {
                ctx.strokeStyle = isProfit ? '#10b981' : '#ef4444';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
    }

    /**
     * 基準線の描画
     */
    function drawReferenceLine(ctx, padding, chartWidth, chartHeight, value, adjustedMin, adjustedRange, label, color = 'rgba(255, 255, 255, 0.3)') {
        if (adjustedMin <= value && adjustedMin + adjustedRange >= value) {
            const y = padding + chartHeight - ((value - adjustedMin) / adjustedRange * chartHeight);
            ctx.strokeStyle = color;
            ctx.lineWidth = color.includes('ef4444') ? 2 : 1;
            ctx.setLineDash(color.includes('ef4444') ? [3, 3] : [5, 5]);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = color.includes('ef4444') ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.7)';
            ctx.font = color.includes('ef4444') ? 'bold 10px sans-serif' : '10px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = color.includes('ef4444') ? 'top' : 'bottom';
            const yOffset = color.includes('ef4444') ? 2 : -2;
            ctx.fillText(label, padding + 5, y + yOffset);
        }
    }

    /**
     * 言語関連のUI更新
     */
    function updateLanguageUI() {
        const languageElements = {
            'appTitle': 'title',
            'currentFundsLabel': 'currentFunds',
            'quickInputTitle': 'quickInput',
            'playerLabel': 'playerScore',
            'bankerLabel': 'bankerScore',
            'winnerLabel': 'winner',
            'scoreDiffLabel': 'scoreDifference',
            'calculateText': 'calculate',
            'riskManagementTitle': 'riskManagement',
            'fundsRatioLabel': 'fundsRatio',
            'riskLevelLabel': 'riskLevel',
            'lossLimitLabel': 'lossLimit',
            'currentLossLabel': 'currentLoss',
            'pauseText': 'pause',
            'stopText': 'stop',
            'betSuggestionTitle': 'nextBetSuggestion',
            'statusTitle': 'status',
            'strategyVerificationLabel': 'strategyVerification',
            'martingaleLabel': 'martingale',
            'consecutiveLossesLabel': 'consecutiveLosses',
            'currentBetLabel': 'currentBetAmount',
            'tieStatusLabel': 'tieStatus',
            'resetText': 'resetAllData',
            'fundsProgressTitle': 'fundsProgress',
            'gameHistoryTitle': 'gameHistory',
            'chartPlaceholder': 'chartPlaceholder',
            'languageSectionTitle': 'languageSection',
            'languageLabel': 'language',
            'fundsSectionTitle': 'fundsSection',
            'initialFundsLabel': 'initialFunds',
            'strategySectionTitle': 'strategySection',
            'verificationCountLabel': 'verificationCount',
            'riskSectionTitle': 'riskSection',
            'lossLimitPercentLabel': 'lossLimitPercent',
            'applyText': 'apply',
            'cancelText': 'cancel'
        };

        Object.entries(languageElements).forEach(([elementId, translationKey]) => {
            const element = document.getElementById(elementId);
            if (element) {
                if (translationKey === 'status') {
                    element.textContent = '📊 ' + t(translationKey);
                } else if (translationKey === 'fundsProgress') {
                    element.textContent = '📈 ' + t(translationKey);
                } else if (translationKey === 'gameHistory') {
                    element.textContent = '📋 ' + t(translationKey);
                } else if (elementId.includes('Label') && !elementId.includes('Title')) {
                    element.textContent = t(translationKey) + ':';
                } else {
                    element.textContent = t(translationKey);
                }
            }
        });

        // 現在の言語表示を更新
        const currentLangOption = window.TranslationModule.getLanguageOption(window.AppState.get('currentLanguage'));
        setText('currentLang', currentLangOption ? currentLangOption.name : '日本語');

        // 設定スライダーのラベル更新
        updateLossLimitDisplay();
    }

    /**
     * 損失限度表示の更新
     */
    function updateLossLimitDisplay() {
        const state = window.AppState.getState();
        const percentage = document.getElementById('lossLimitSlider')?.value || state.lossLimitPercentage;
        const amount = state.initialBankroll * (percentage / 100);
        const formattedAmount = formatCurrency(amount);
        
        setText('currentLossLimitPercent', percentage + '%');
        setText('currentLimitDisplay', `${t('lossLimit')} ${formattedAmount} (${percentage}%)`);
        setText('sliderValuePopup', percentage + '%');
    }

    /**
     * 結果表示の更新
     */
    function updateResultDisplay(winner, scoreDiff) {
        const winnerElement = document.getElementById('winnerValue');
        if (winnerElement) {
            winnerElement.textContent = winner;
            winnerElement.className = getWinnerClass(winner);
        }
        
        setText('scoreDiffValue', scoreDiff.toString());
        toggleVisibility('resultDisplay', true);
    }

    /**
     * スコアボタンの選択状態をクリア
     */
    function clearScoreSelections() {
        document.querySelectorAll('.score-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    /**
     * イベントリスナーの設定
     */
    function setupEventListeners() {
        // スコアボタンのイベント
        setupScoreButtons();
        
        // メインボタンのイベント
        addEventListenerSafe('calculateBtn', 'click', handleCalculateClick);
        addEventListenerSafe('resetBtn', 'click', handleResetClick);
        addEventListenerSafe('pauseBtn', 'click', () => window.RiskManagementModule.pauseSession());
        addEventListenerSafe('stopBtn', 'click', () => window.RiskManagementModule.endSession('manual'));
        addEventListenerSafe('resumeBtn', 'click', () => window.RiskManagementModule.resumeSession());
        
        // 設定関連のイベント
        addEventListenerSafe('settingsBtn', 'click', openSettings);
        addEventListenerSafe('applySettings', 'click', applySettings);
        addEventListenerSafe('cancelSettings', 'click', closeSettings);
        
        // 損失限度スライダー
        addEventListenerSafe('lossLimitSlider', 'input', handleLossLimitSliderChange);
        
        // 設定モーダルの外部クリック
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    closeSettings();
                }
            });
        }
        
        // PWA関連
        setupPWAEvents();
        
        // ウィンドウリサイズ
        window.addEventListener('resize', () => {
            setTimeout(updateChart, 100);
        });
    }

    /**
     * スコアボタンの設定
     */
    function setupScoreButtons() {
        document.querySelectorAll('[data-player]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-player]').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                window.AppState.setState({ selectedPlayerScore: parseInt(btn.dataset.player) });
                checkAutoCalculate();
            });
        });
        
        document.querySelectorAll('[data-banker]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-banker]').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                window.AppState.setState({ selectedBankerScore: parseInt(btn.dataset.banker) });
                checkAutoCalculate();
            });
        });
    }

    /**
     * 自動計算チェック
     */
    function checkAutoCalculate() {
        const state = window.AppState.getState();
        if (state.selectedPlayerScore !== null && state.selectedBankerScore !== null && 
            !state.sessionEnded && !state.isPaused) {
            setTimeout(() => {
                handleCalculateClick();
                window.AppState.setState({ selectedPlayerScore: null, selectedBankerScore: null });
                clearScoreSelections();
            }, 100);
        }
    }

    /**
     * 計算ボタンクリック処理
     */
    function handleCalculateClick() {
        const state = window.AppState.getState();
        
        if (state.sessionEnded || state.isPaused) return;
        if (state.selectedPlayerScore === null || state.selectedBankerScore === null) return;
        
        const result = window.GameLogicModule.calculateGameResult(
            state.selectedPlayerScore, 
            state.selectedBankerScore
        );
        
        // 前回のベット提案があった場合、自動的に勝敗を適用
        if (state.activeBet && result.winner !== t('tie')) {
            const betResult = (state.activeBet === result.winner) ? 'win' : 'lose';
            window.GameLogicModule.applyBetResult(betResult);
            window.AppState.setState({ activeBet: null });
        }
        
        // 結果表示を更新
        const scoreDiff = Math.abs(
            window.UtilsModule.calculateBaccaratScore(state.selectedPlayerScore) - 
            window.UtilsModule.calculateBaccaratScore(state.selectedBankerScore)
        );
        updateResultDisplay(result.winner, scoreDiff);
        
        // ゲームロジックで結果を処理
        if (result.winner === t('tie')) {
            window.GameLogicModule.handleTieResult(result);
        } else {
            window.GameLogicModule.handleNonTieResult(result);
        }
        
        updateUI();
    }

    /**
     * リセットボタンクリック処理
     */
    function handleResetClick() {
        const state = window.AppState.getState();
        if (!state.sessionEnded && !confirm(t('confirmReset'))) return;
        
        window.GameLogicModule.resetGame();
        clearScoreSelections();
        toggleVisibility('resultDisplay', false);
        updateUI();
    }

    /**
     * 損失限度スライダー変更処理
     */
    function handleLossLimitSliderChange(e) {
        const percentage = parseInt(e.target.value);
        const state = window.AppState.getState();
        const lossLimitAmount = state.initialBankroll * (percentage / 100);
        
        window.AppState.setState({ 
            lossLimitPercentage: percentage,
            lossLimitAmount
        });
        
        updateLossLimitDisplay();
        updateRiskDisplay();
    }

    /**
     * 設定モーダルを開く
     */
    function openSettings() {
        const state = window.AppState.getState();
        
        document.getElementById('languageSelect').value = state.currentLanguage;
        document.getElementById('initialFundsInput').value = state.initialBankroll;
        document.getElementById('verificationCountInput').value = state.requiredVerifications;
        document.getElementById('lossLimitSlider').value = state.lossLimitPercentage;
        
        updateLossLimitDisplay();
        toggleVisibility('settingsModal', true);
    }

    /**
     * 設定を適用
     */
    function applySettings() {
        const newLanguage = document.getElementById('languageSelect').value;
        const newInitialBankroll = parseInt(document.getElementById('initialFundsInput').value);
        const newRequiredVerifications = parseInt(document.getElementById('verificationCountInput').value);
        const newLossLimitPercentage = parseInt(document.getElementById('lossLimitSlider').value);
        
        const state = window.AppState.getState();
        const updates = {};
        
        // 言語変更
        if (newLanguage !== state.currentLanguage) {
            updates.currentLanguage = newLanguage;
        }
        
        // 資金設定変更
        if (newInitialBankroll !== state.initialBankroll) {
            updates.initialBankroll = newInitialBankroll;
            updates.bankroll = newInitialBankroll;
            updates.bankrollHistory = [{ round: 0, amount: newInitialBankroll }];
        }
        
        // その他の設定
        updates.requiredVerifications = newRequiredVerifications;
        updates.lossLimitPercentage = newLossLimitPercentage;
        updates.lossLimitAmount = (updates.initialBankroll || state.initialBankroll) * (newLossLimitPercentage / 100);
        
        window.AppState.setState(updates);
        closeSettings();
        updateLanguageUI();
        updateUI();
    }

    /**
     * 設定モーダルを閉じる
     */
    function closeSettings() {
        toggleVisibility('settingsModal', false);
    }

    /**
     * PWAイベントの設定
     */
    function setupPWAEvents() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            toggleVisibility('installPrompt', true);
        });

        addEventListenerSafe('installBtn', 'click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
                toggleVisibility('installPrompt', false);
            }
        });

        addEventListenerSafe('closeInstall', 'click', () => {
            toggleVisibility('installPrompt', false);
        });
    }

    /**
     * 通知表示
     */
    function showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 9999;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }

    // 公開API
    return {
        updateUI,
        updateFundsDisplay,
        updateRiskDisplay,
        updateStatusDisplay,
        updateSuggestionDisplay,
        updateHistoryDisplay,
        updateChart,
        updateLanguageUI,
        updateLossLimitDisplay,
        updateResultDisplay,
        clearScoreSelections,
        setupEventListeners,
        showNotification,
        openSettings,
        closeSettings
    };
})();

// グローバルスコープにエクスポート
window.UIModule = UIModule;