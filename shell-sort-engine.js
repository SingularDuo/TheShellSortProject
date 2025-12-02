/**
 * ============================================
 * SHELL SORT VISUALIZATION ENGINE
 * Mô phỏng Shell Sort với animation như VisuAlgo
 * ============================================
 *
 * STRUCTURE:
 * - Step = { type, indices, values, gap, line, description }
 * - Types: 'init', 'gap', 'compare', 'shift', 'insert', 'sorted'
 *
 * FLOW:
 * 1. collectShellSortSteps(array) → tạo danh sách steps
 * 2. playAnimation() → phát animation từng step
 * 3. renderStep(step) → render trạng thái hiện tại
 * 4. highlightPseudocode(line) → đồng bộ code
 */

class ShellSortVisualizer {
    constructor() {
        // State
        this.originalArray = [];
        this.currentArray = [];
        this.steps = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.animationSpeed = 1000;
        this.timer = null;

        // Stats
        this.comparisons = 0;
        this.swaps = 0;
        this.currentGap = 0;
        this.startTime = 0;

        // DOM Elements
        this.barsContainer = document.getElementById('barsContainer');
        this.descriptionBox = document.getElementById('descriptionBox');
        this.comparisonsEl = document.getElementById('comparisons');
        this.swapsEl = document.getElementById('swaps');
        this.currentGapEl = document.getElementById('currentGap');
        this.timeEl = document.getElementById('time');
        this.speedSelect = document.getElementById('speed');

        console.log('✅ Shell Sort Visualizer Engine Loaded');
    }

    // ==========================================
    // 1. GAP SEQUENCE GENERATION
    // ==========================================
    generateGapSequence(n, type) {
        const gaps = [];

        switch(type) {
            case 'shell':
                for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
                    gaps.push(gap);
                }
                break;

            case 'hibbard':
                let k = 1;
                while (Math.pow(2, k) - 1 < n) {
                    gaps.unshift(Math.pow(2, k) - 1);
                    k++;
                }
                break;

            case 'knuth':
                k = 1;
                while ((Math.pow(3, k) - 1) / 2 < n) {
                    gaps.unshift(Math.floor((Math.pow(3, k) - 1) / 2));
                    k++;
                }
                break;

            case 'ciura':
                const ciuraSeq = [1, 4, 10, 23, 57, 132, 301, 701, 1750];
                for (let i = ciuraSeq.length - 1; i >= 0; i--) {
                    if (ciuraSeq[i] < n) {
                        gaps.push(ciuraSeq[i]);
                    }
                }
                if (gaps.length === 0 || gaps[gaps.length - 1] !== 1) {
                    gaps.push(1);
                }
                break;
        }

        return gaps;
    }

    // ==========================================
    // 2. COLLECT STEPS (MAIN ALGORITHM)
    // ==========================================
    collectShellSortSteps(array) {
        const steps = [];
        const arr = [...array];
        const n = arr.length;

        let comparisons = 0;
        let swaps = 0;

        const gapType = document.getElementById('gapSequence').value;
        const gaps = this.generateGapSequence(n, gapType);

        // Step: Initialization
        steps.push({
            type: 'init',
            array: [...arr],
            indices: [],
            gap: 0,
            line: 8,
            description: `Khởi tạo Shell Sort với mảng [${arr.join(', ')}]`,
            comparisons,
            swaps
        });

        // Loop through each gap
        for (let gap of gaps) {
            // Step: New gap
            steps.push({
                type: 'gap',
                array: [...arr],
                indices: [],
                gap: gap,
                line: 9,
                description: `Bắt đầu vòng lặp với Gap = ${gap}`,
                comparisons,
                swaps
            });

            // Insertion sort with gap
            for (let i = gap; i < n; i++) {
                const temp = arr[i];
                let j = i;

                // Step: Select temp
                steps.push({
                    type: 'select',
                    array: [...arr],
                    indices: [i],
                    gap: gap,
                    line: 11,
                    description: `Chọn phần tử arr[${i}] = ${temp} làm temp`,
                    comparisons,
                    swaps
                });

                // Compare and shift loop
                while (j >= gap && arr[j - gap] > temp) {
                    comparisons++;

                    // Step: Compare
                    steps.push({
                        type: 'compare',
                        array: [...arr],
                        indices: [j, j - gap],
                        gap: gap,
                        line: 13,
                        description: `So sánh arr[${j - gap}] (${arr[j - gap]}) > temp (${temp})? → True`,
                        comparisons,
                        swaps
                    });

                    // Shift element
                    arr[j] = arr[j - gap];
                    swaps++;

                    // Step: Shift
                    steps.push({
                        type: 'shift',
                        array: [...arr],
                        indices: [j, j - gap],
                        gap: gap,
                        line: 14,
                        description: `Dịch chuyển: arr[${j}] = arr[${j - gap}] (${arr[j]})`,
                        comparisons,
                        swaps
                    });

                    j -= gap;
                }

                // Final comparison (false case)
                if (j >= gap) {
                    comparisons++;
                    steps.push({
                        type: 'compare',
                        array: [...arr],
                        indices: [j, j - gap],
                        gap: gap,
                        line: 13,
                        description: `So sánh arr[${j - gap}] (${arr[j - gap]}) > temp (${temp})? → False`,
                        comparisons,
                        swaps
                    });
                }

                // Insert temp to correct position
                arr[j] = temp;

                // Step: Insert
                steps.push({
                    type: 'insert',
                    array: [...arr],
                    indices: [j],
                    gap: gap,
                    line: 16,
                    description: `Chèn temp (${temp}) vào vị trí j = ${j}`,
                    comparisons,
                    swaps
                });
            }
        }

        // Step: Sorted
        steps.push({
            type: 'sorted',
            array: [...arr],
            indices: Array.from({ length: n }, (_, i) => i),
            gap: 0,
            line: 17,
            description: `🎉 Mảng đã được sắp xếp: [${arr.join(', ')}]`,
            comparisons,
            swaps
        });

        return steps;
    }

    // ==========================================
    // 3. RENDER FUNCTIONS
    // ==========================================
    renderBars(array, highlightIndices = [], highlightType = 'normal') {
        this.barsContainer.innerHTML = '';

        if (!array || array.length === 0) {
            this.barsContainer.innerHTML = '<div class="empty-state">Mảng rỗng</div>';
            return;
        }

        const maxVal = Math.max(...array);
        const containerWidth = this.barsContainer.offsetWidth - 40;
        const barWidth = Math.min(60, (containerWidth - array.length * 5) / array.length);

        array.forEach((val, idx) => {
            // Wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'bar-wrapper';
            wrapper.style.position = 'relative';

            // Bar
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.width = barWidth + 'px';
            bar.style.height = Math.max(40, (val / maxVal * 280)) + 'px';
            bar.textContent = val;
            bar.id = 'bar-' + idx;

            // Apply highlight based on type
            if (highlightIndices.includes(idx)) {
                if (highlightType === 'compare') {
                    bar.classList.add('comparing');
                } else if (highlightType === 'shift' || highlightType === 'insert') {
                    bar.classList.add('swapping');
                } else if (highlightType === 'sorted') {
                    bar.classList.add('sorted');
                } else if (highlightType === 'select') {
                    bar.classList.add('comparing');
                }
            }

            // Index label
            const indexLabel = document.createElement('div');
            indexLabel.className = 'bar-index';
            indexLabel.textContent = idx;

            wrapper.appendChild(bar);
            wrapper.appendChild(indexLabel);
            this.barsContainer.appendChild(wrapper);
        });
    }

    renderStep(step) {
        if (!step) return;

        // Render bars with appropriate highlighting
        this.renderBars(step.array, step.indices, step.type);

        // Update description box
        this.descriptionBox.textContent = step.description;

        // Update stats
        this.comparisonsEl.textContent = step.comparisons;
        this.swapsEl.textContent = step.swaps;
        this.currentGapEl.textContent = step.gap;

        // Highlight pseudocode
        this.highlightPseudocode(step.line);
    }

    highlightPseudocode(line) {
        // Remove all active highlights
        document.querySelectorAll('.pseudocode-line').forEach(el => {
            el.classList.remove('active');
        });

        // Add active to current line
        const activeLine = document.querySelector(`.pseudocode-line[data-line="${line}"]`);
        if (activeLine) {
            activeLine.classList.add('active');
            activeLine.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // ==========================================
    // 4. ANIMATION CONTROL
    // ==========================================
    setArray() {
        try {
            const input = document.getElementById('arrayInput').value;
            this.originalArray = input.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));

            if (this.originalArray.length === 0) {
                alert('⚠️ Vui lòng nhập mảng hợp lệ!');
                return;
            }

            this.currentArray = [...this.originalArray];
            this.descriptionBox.textContent = `Đã đặt mảng: [${this.originalArray.join(', ')}]. Nhấn Play để bắt đầu.`;

            this.reset();
            this.renderBars(this.currentArray);

            console.log('✅ Array set:', this.originalArray);
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Lỗi: ' + error.message);
        }
    }

    randomArray() {
        const size = 12;
        this.originalArray = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
        document.getElementById('arrayInput').value = this.originalArray.join(', ');

        this.currentArray = [...this.originalArray];
        this.descriptionBox.textContent = `Tạo mảng ngẫu nhiên: [${this.originalArray.join(', ')}]. Nhấn Play để bắt đầu.`;

        this.reset();
        this.renderBars(this.currentArray);

        console.log('✅ Random array:', this.originalArray);
    }

    play() {
        if (this.originalArray.length === 0) {
            alert('⚠️ Vui lòng đặt mảng trước!');
            return;
        }

        // Generate steps if not exists
        if (this.steps.length === 0) {
            console.log('🔄 Generating steps...');
            this.steps = this.collectShellSortSteps(this.originalArray);
            console.log(`✅ Generated ${this.steps.length} steps`);
        }

        // Reset to beginning if at end
        if (this.currentStep >= this.steps.length - 1) {
            this.currentStep = 0;
        }

        this.isPlaying = true;
        this.startTime = Date.now();

        const speed = parseInt(this.speedSelect.value) || 1000;

        const animate = () => {
            if (!this.isPlaying) return;

            if (this.currentStep < this.steps.length - 1) {
                this.currentStep++;
                this.renderStep(this.steps[this.currentStep]);

                // Update time
                const elapsed = Date.now() - this.startTime;
                this.timeEl.textContent = elapsed;

                this.timer = setTimeout(animate, speed);
            } else {
                this.isPlaying = false;
                this.renderStep(this.steps[this.currentStep]);
            }
        };

        // Render first step
        this.renderStep(this.steps[this.currentStep]);
        this.timer = setTimeout(animate, speed);

        console.log('▶️ Animation started');
    }

    pause() {
        this.isPlaying = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        console.log('⏸️ Animation paused');
    }

    stepForward() {
        this.pause();

        // Generate steps if not exists
        if (this.steps.length === 0) {
            this.steps = this.collectShellSortSteps(this.originalArray);
        }

        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.renderStep(this.steps[this.currentStep]);
        }

        console.log(`⏭️ Step forward to ${this.currentStep}`);
    }

    stepBackward() {
        this.pause();

        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep(this.steps[this.currentStep]);
        }

        console.log(`⏮️ Step backward to ${this.currentStep}`);
    }

    reset() {
        this.pause();

        this.steps = [];
        this.currentStep = 0;
        this.comparisons = 0;
        this.swaps = 0;
        this.currentGap = 0;

        this.comparisonsEl.textContent = '0';
        this.swapsEl.textContent = '0';
        this.currentGapEl.textContent = '0';
        this.timeEl.textContent = '0';

        this.descriptionBox.textContent = 'Đã reset visualizer. Nhấn Play để bắt đầu.';

        // Clear pseudocode highlight
        document.querySelectorAll('.pseudocode-line').forEach(el => {
            el.classList.remove('active');
        });

        this.renderBars(this.originalArray);

        console.log('🔄 Reset complete');
    }
}

// ==========================================
// 5. INITIALIZATION
// ==========================================
const visualizer = new ShellSortVisualizer();

// Auto-load initial array on page load
window.addEventListener('load', () => {
    console.log('🚀 Page loaded - Shell Sort Engine Ready');
    visualizer.setArray();
});

// Make visualizer global for console debugging
window.visualizer = visualizer;
console.log('💡 Debug: Type "visualizer" in console');
