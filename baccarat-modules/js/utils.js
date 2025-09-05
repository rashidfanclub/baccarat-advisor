// utils.js - ユーティリティ関数モジュール

const UtilsModule = (() => {
    
    /**
     * 通貨フォーマット（スケールに応じて適切に表示）
     */
    function formatCurrency(amount) {
        if (amount >= 1000000) {
            return '¥' + (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return '¥' + (amount / 1000).toFixed(0) + 'k';
        } else {
            return '¥' + amount.toLocaleString();
        }
    }

    /**
     * 翻訳ヘルパー（現在の言語設定を使用）
     */
    function t(key) {
        return window.TranslationModule?.t(key) || key;
    }

    /**
     * 勝者に応じたCSSクラスを取得
     */
    function getWinnerClass(winner) {
        const playerText = t('player');
        const bankerText = t('banker');
        
        if (winner === playerText) return 'winner-player';
        if (winner === bankerText) return 'winner-banker';
        return 'winner-tie';
    }

    /**
     * リスクレベルの計算
     */
    function calculateRiskLevel(lossPercentage, lossLimitPercentage) {
        if (lossPercentage >= lossLimitPercentage) {
            return { level: 'high', text: t('high'), class: 'risk-high' };
        } else if (lossPercentage >= lossLimitPercentage * 0.75) {
            return { level: 'high', text: t('high'), class: 'risk-high' };
        } else if (lossPercentage >= lossLimitPercentage * 0.5) {
            return { level: 'medium', text: t('medium'), class: 'risk-medium' };
        } else {
            return { level: 'safe', text: t('safe'), class: 'risk-safe' };
        }
    }

    /**
     * バカラスコアの計算（下一桁）
     */
    function calculateBaccaratScore(score) {
        return score % 10;
    }

    /**
     * ゲーム結果の判定
     */
    function determineWinner(playerScore, bankerScore) {
        const finalPlayerScore = calculateBaccaratScore(playerScore);
        const finalBankerScore = calculateBaccaratScore(bankerScore);
        
        if (finalPlayerScore > finalBankerScore) {
            return t('player');
        } else if (finalBankerScore > finalPlayerScore) {
            return t('banker');
        } else {
            return t('tie');
        }
    }

    /**
     * スコア差のタイプ（偶数/奇数）を判定
     */
    function getDifferenceType(playerScore, bankerScore) {
        const diff = Math.abs(calculateBaccaratScore(playerScore) - calculateBaccaratScore(bankerScore));
        return diff % 2 === 0 ? t('even') : t('odd');
    }

    /**
     * 要素の表示/非表示を切り替え
     */
    function toggleVisibility(elementId, show) {
        const element = document.getElementById(elementId);
        if (element) {
            if (show) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    }

    /**
     * 要素のテキスト設定
     */
    function setText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * 要素のHTMLの設定
     */
    function setHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    }

    /**
     * CSSクラスの追加
     */
    function addClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add(className);
        }
    }

    /**
     * CSSクラスの削除
     */
    function removeClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove(className);
        }
    }

    /**
     * CSSクラスの設定（既存のクラスを削除して新しいクラスを追加）
     */
    function setClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.className = className;
        }
    }

    /**
     * 数値の検証
     */
    function validateNumber(value, min = null, max = null) {
        const num = parseInt(value);
        if (isNaN(num)) return false;
        if (min !== null && num < min) return false;
        if (max !== null && num > max) return false;
        return true;
    }

    /**
     * 配列の最後のN個の要素を取得
     */
    function getLastN(array, n) {
        return array.slice(-n);
    }

    /**
     * 配列から非タイ結果のみをフィルタ
     */
    function filterNonTieResults(history) {
        return history.filter(r => r.winner !== t('tie'));
    }

    /**
     * デバウンス関数
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * ランダムID生成
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * ローカルストレージ操作（代替としてメモリ変数を使用）
     */
    const memoryStorage = {};
    
    function saveToStorage(key, data) {
        try {
            memoryStorage[key] = JSON.stringify(data);
            return true;
        } catch (error) {
            console.error('Storage save failed:', error);
            return false;
        }
    }

    function loadFromStorage(key, defaultValue = null) {
        try {
            const data = memoryStorage[key];
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Storage load failed:', error);
            return defaultValue;
        }
    }

    function removeFromStorage(key) {
        delete memoryStorage[key];
    }

    /**
     * エラーハンドリング
     */
    function handleError(error, context = 'Unknown') {
        console.error(`[${context}] Error:`, error);
        
        // 本番環境では詳細なエラーを隠す
        const userMessage = error.message || 'An unexpected error occurred';
        
        // エラー通知（必要に応じてUI通知システムに接続）
        if (window.UIModule?.showNotification) {
            window.UIModule.showNotification(userMessage, 'error');
        }
    }

    /**
     * パフォーマンス測定
     */
    function measurePerformance(name, func) {
        const startTime = performance.now();
        const result = func();
        const endTime = performance.now();
        console.log(`[Performance] ${name}: ${(endTime - startTime).toFixed(2)}ms`);
        return result;
    }

    /**
     * オブジェクトのディープコピー
     */
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    /**
     * DOM要素が存在するかチェック
     */
    function elementExists(elementId) {
        return document.getElementById(elementId) !== null;
    }

    /**
     * イベントリスナーの安全な追加
     */
    function addEventListenerSafe(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
            return true;
        } else {
            console.warn(`Element ${elementId} not found for event listener`);
            return false;
        }
    }

    // 公開API
    return {
        formatCurrency,
        t,
        getWinnerClass,
        calculateRiskLevel,
        calculateBaccaratScore,
        determineWinner,
        getDifferenceType,
        toggleVisibility,
        setText,
        setHTML,
        addClass,
        removeClass,
        setClass,
        validateNumber,
        getLastN,
        filterNonTieResults,
        debounce,
        generateId,
        saveToStorage,
        loadFromStorage,
        removeFromStorage,
        handleError,
        measurePerformance,
        deepClone,
        elementExists,
        addEventListenerSafe
    };
})();

// グローバルスコープにエクスポート
window.UtilsModule = UtilsModule;