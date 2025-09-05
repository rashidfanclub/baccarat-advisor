// components.js - UIコンポーネント生成モジュール

const ComponentsModule = (() => {
    const { formatCurrency, t, getWinnerClass } = window.UtilsModule;

    /**
     * クイック入力コンポーネントの生成
     */
    function createQuickInputComponent() {
        return `
            <div class="card">
                <h3 class="card-title">
                    <span>⚡</span>
                    <span id="quickInputTitle">${t('quickInput')}</span>
                </h3>
                
                <div class="quick-input-grid">
                    <div class="score-section">
                        <div class="score-label" id="playerLabel">${t('playerScore')}</div>
                        <div class="score-grid">
                            ${Array.from({ length: 10 }, (_, i) => 
                                `<button class="score-btn" data-player="${i}">${i}</button>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="score-section">
                        <div class="score-label" id="bankerLabel">${t('bankerScore')}</div>
                        <div class="score-grid">
                            ${Array.from({ length: 10 }, (_, i) => 
                                `<button class="score-btn" data-banker="${i}">${i}</button>`
                            ).join('')}
                        </div>
                    </div>
                </div>

                <div id="resultDisplay" class="result-display hidden">
                    <div class="result-row">
                        <span id="winnerLabel">${t('winner')}:</span>
                        <span id="winnerValue"></span>
                    </div>
                    <div class="result-row">
                        <span id="scoreDiffLabel">${t('scoreDifference')}:</span>
                        <span id="scoreDiffValue"></span>
                    </div>
                </div>
                
                <button class="calculate-btn" id="calculateBtn">
                    <span>🧮</span>
                    <span id="calculateText">${t('calculate')}</span>
                </button>
            </div>
        `;
    }

    /**
     * リスク管理コンポーネントの生成
     */
    function createRiskManagementComponent() {
        return `
            <div class="card risk-card">
                <h3 class="card-title">
                    <span>🛡️</span>
                    <span id="riskManagementTitle">${t('riskManagement')}</span>
                </h3>
                
                <div class="risk-display">
                    <div class="risk-item">
                        <div class="risk-label" id="fundsRatioLabel">${t('fundsRatio')}</div>
                        <div class="risk-value risk-percentage" id="fundsRatio">100.0%</div>
                    </div>
                    <div class="risk-item">
                        <div class="risk-label" id="riskLevelLabel">${t('riskLevel')}</div>
                        <div class="risk-level risk-safe" id="riskLevel">${t('safe')}</div>
                    </div>
                </div>
                
                <div class="loss-limit-control">
                    <div class="risk-input">
                        <label id="lossLimitLabel">${t('lossLimit')}</label>
                        <span id="lossLimitDisplay">¥20,000 (20%)</span>
                    </div>
                </div>
                
                <div class="risk-controls">
                    <div class="risk-input">
                        <label id="currentLossLabel">${t('currentLoss')}</label>
                        <span id="currentLoss" style="color: #10b981; font-weight: bold;">¥0</span>
                    </div>
                </div>
                
                <div class="control-buttons">
                    <button class="button btn-pause" id="pauseBtn">
                        <span>⏸️</span>
                        <span id="pauseText">${t('pause')}</span>
                    </button>
                    <button class="button btn-stop" id="stopBtn">
                        <span>🛑</span>
                        <span id="stopText">${t('stop')}</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * ベット提案コンポーネントの生成
     */
    function createBetSuggestionComponent() {
        return `
            <div class="card">
                <h3 class="card-title">
                    <span>🎯</span>
                    <span id="betSuggestionTitle">${t('nextBetSuggestion')}</span>
                </h3>
                <div class="suggestion-box">
                    <div class="suggestion-text" id="suggestionText">${t('dataInsufficient')}</div>
                </div>
            </div>
        `;
    }

    /**
     * ステータスコンポーネントの生成
     */
    function createStatusComponent() {
        return `
            <div class="card">
                <h3 class="card-title" id="statusTitle">📊 ${t('status')}</h3>
                
                <div class="status-item">
                    <span id="strategyVerificationLabel">${t('strategyVerification')}:</span>
                    <span class="status-badge status-verifying" id="verificationStatus">${t('initialVerification')}</span>
                </div>
                
                <div class="status-item">
                    <span id="martingaleLabel">${t('martingale')}:</span>
                    <span class="status-badge status-inactive" id="martingaleStatus">${t('inactive')}</span>
                </div>
                
                <div class="status-item">
                    <span id="consecutiveLossesLabel">${t('consecutiveLosses')}:</span>
                    <span style="color: #ef4444; font-weight: bold;" id="consecutiveLossesCount">0${t('times')}</span>
                </div>
                
                <div class="status-item">
                    <span id="currentBetLabel">${t('currentBetAmount')}:</span>
                    <span style="color: #f59e0b; font-weight: bold;" id="currentBetAmount">¥500</span>
                </div>
                
                <div class="status-item hidden" id="tieStatusItem">
                    <span id="tieStatusLabel">${t('tieStatus')}:</span>
                    <span class="status-badge" style="background: #581c87; color: #a855f7;" id="tieStatusValue"></span>
                </div>
            </div>
        `;
    }

    /**
     * チャートコンポーネントの生成
     */
    function createChartComponent() {
        return `
            <div class="card">
                <h3 class="card-title" id="fundsProgressTitle">📈 ${t('fundsProgress')}</h3>
                <div class="chart-container" id="chartContainer">
                    <canvas id="fundsChart" class="chart-canvas"></canvas>
                    <span id="chartPlaceholder" style="position: absolute;">${t('chartPlaceholder')}</span>
                </div>
            </div>
        `;
    }

    /**
     * 履歴コンポーネントの生成
     */
    function createHistoryComponent() {
        return `
            <div class="card">
                <h3 class="card-title" id="gameHistoryTitle">📋 ${t('gameHistory')}</h3>
                <div class="history-container" id="historyContainer">
                    <div class="history-empty" id="historyEmpty">${t('noHistoryYet')}</div>
                </div>
            </div>
        `;
    }

    /**
     * 履歴アイテムの生成
     */
    function createHistoryItem(result, index, totalLength) {
        return `
            <div class="history-item">
                <span>#${totalLength - index} P:${result.playerScore} B:${result.bankerScore}</span>
                <span class="${getWinnerClass(result.winner)}">${result.winner} (${result.diffType})</span>
            </div>
        `;
    }

    /**
     * ステータスバッジの生成
     */
    function createStatusBadge(type, text) {
        const statusClasses = {
            verified: 'status-badge status-verified',
            verifying: 'status-badge status-verifying',
            active: 'status-badge status-active',
            inactive: 'status-badge status-inactive',
            safe: 'risk-level risk-safe',
            medium: 'risk-level risk-medium',
            high: 'risk-level risk-high'
        };

        const className = statusClasses[type] || 'status-badge';
        return `<span class="${className}">${text}</span>`;
    }

    /**
     * スコアボタンの選択状態を更新
     */
    function updateScoreButtonSelection(type, value) {
        // 既存の選択をクリア
        document.querySelectorAll(`[data-${type}]`).forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // 新しい選択を適用
        if (value !== null) {
            const button = document.querySelector(`[data-${type}="${value}"]`);
            if (button) {
                button.classList.add('selected');
            }
        }
    }

    /**
     * コンポーネントの初期化
     */
    function initializeComponents() {
        // 各コンポーネントを対応するコンテナに挿入
        const componentMappings = [
            { selector: '#quickInputComponent', generator: createQuickInputComponent },
            { selector: '#riskManagementComponent', generator: createRiskManagementComponent },
            { selector: '#betSuggestionComponent', generator: createBetSuggestionComponent },
            { selector: '#statusComponent', generator: createStatusComponent },
            { selector: '#chartComponent', generator: createChartComponent },
            { selector: '#historyComponent', generator: createHistoryComponent }
        ];

        componentMappings.forEach(({ selector, generator }) => {
            const container = document.querySelector(selector);
            if (container) {
                container.innerHTML = generator();
            } else {
                console.warn(`Container ${selector} not found`);
            }
        });
    }

    // 公開API
    return {
        createQuickInputComponent,
        createRiskManagementComponent,
        createBetSuggestionComponent,
        createStatusComponent,
        createChartComponent,
        createHistoryComponent,
        createHistoryItem,
        createStatusBadge,
        updateScoreButtonSelection,
        initializeComponents
    };
})();

// グローバルスコープにエクスポート
window.ComponentsModule = ComponentsModule;