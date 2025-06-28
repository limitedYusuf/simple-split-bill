const { createApp, ref, computed, watch } = Vue;

createApp({
  setup() {
    const totalBill = ref(0);
    const formattedBill = ref("");
    const totalBillError = ref("");
    const splitMethod = ref("equal");
    const people = ref([
      { name: "Yusuf", percentage: 0, amount: 0, formattedAmount: "" },
      {
        name: "Pacar Halusinasi nya",
        percentage: 0,
        amount: 0,
        formattedAmount: "",
      },
    ]);
    const percentageError = ref("");
    const manualError = ref("");

    const currentDate = computed(() => {
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Date().toLocaleDateString("id-ID", options);
    });

    const equalShare = computed(() => {
      if (totalBill.value <= 0 || people.value.length === 0) return 0;
      return totalBill.value / people.value.length;
    });

    const remainingAmount = computed(() => {
      if (splitMethod.value !== "manual") return 0;
      const totalPaid = people.value.reduce(
        (sum, person) => sum + person.amount,
        0
      );
      return totalBill.value - totalPaid;
    });

    const formatCurrency = (value) => {
      return new Intl.NumberFormat("id-ID").format(Math.round(value));
    };

    const parseCurrency = (value) => {
      return parseInt(value.replace(/[^0-9]/g, "")) || 0;
    };

    const formatCurrencyInput = (event) => {
      const cursorPosition = event.target.selectionStart;
      const originalLength = event.target.value.length;
      const numericValue = parseCurrency(event.target.value);
      totalBill.value = numericValue;
      formattedBill.value =
        numericValue === 0 ? "" : formatCurrency(numericValue);
      const newLength = formattedBill.value.length;
      const cursorOffset = newLength - originalLength;
      Vue.nextTick(() => {
        event.target.setSelectionRange(
          cursorPosition + cursorOffset,
          cursorPosition + cursorOffset
        );
      });
      calculateSplit();
    };

    const formatPersonAmount = (index, event) => {
      const person = people.value[index];
      const cursorPosition = event.target.selectionStart;
      const originalLength = event.target.value.length;
      const numericValue = parseCurrency(event.target.value);
      person.amount = numericValue;
      person.formattedAmount =
        numericValue === 0 ? "" : formatCurrency(numericValue);
      const newLength = person.formattedAmount.length;
      const cursorOffset = newLength - originalLength;
      Vue.nextTick(() => {
        event.target.setSelectionRange(
          cursorPosition + cursorOffset,
          cursorPosition + cursorOffset
        );
      });
      calculateSplit();
    };

    const validateTotalBill = () => {
      if (totalBill.value < 0) {
        totalBillError.value = "Total tagihan tidak boleh negatif";
        return false;
      }
      totalBillError.value = "";
      return true;
    };

    const validatePercentages = () => {
      if (splitMethod.value !== "percentage") {
        percentageError.value = "";
        return true;
      }
      const totalPercentage = people.value.reduce(
        (sum, person) => sum + parseFloat(person.percentage || 0),
        0
      );
      if (Math.abs(totalPercentage - 100) > 0.01) {
        percentageError.value = `Total persentase harus 100% (Sekarang: ${totalPercentage.toFixed(
          2
        )}%)`;
        return false;
      }
      percentageError.value = "";
      return true;
    };

    const validateManualAmounts = () => {
      if (splitMethod.value !== "manual") {
        manualError.value = "";
        return true;
      }
      const totalPaid = people.value.reduce(
        (sum, person) => sum + person.amount,
        0
      );
      if (totalPaid > totalBill.value) {
        manualError.value = `Total pembayaran melebihi tagihan (Rp ${formatCurrency(
          totalPaid
        )} > Rp ${formatCurrency(totalBill.value)})`;
        return false;
      }
      manualError.value = "";
      return true;
    };

    const calculateSplit = () => {
      if (!validateTotalBill()) return;
      if (!validatePercentages()) return;
      if (!validateManualAmounts()) return;
      if (splitMethod.value === "equal") {
        const share = equalShare.value;
        people.value.forEach((person) => {
          person.amount = share;
        });
      } else if (splitMethod.value === "percentage") {
        people.value.forEach((person) => {
          person.amount =
            totalBill.value * (parseFloat(person.percentage || 0) / 100);
        });
      }
    };

    const setSplitMethod = (method) => {
      splitMethod.value = method;
      people.value.forEach((person) => {
        person.formattedAmount = "";
        person.amount = 0;
      });
      calculateSplit();
    };

    const addPerson = () => {
      people.value.push({
        name: "",
        percentage: 0,
        amount: 0,
        formattedAmount: "",
      });
      if (splitMethod.value === "equal") {
        calculateSplit();
      }
    };

    const removePerson = (index) => {
      if (people.value.length <= 1) return;
      people.value.splice(index, 1);
      calculateSplit();
    };

    const resetCalculator = () => {
      totalBill.value = 0;
      formattedBill.value = "";
      totalBillError.value = "";
      splitMethod.value = "equal";
      people.value = [
        { name: "Yusuf", percentage: 0, amount: 0, formattedAmount: "" },
        {
          name: "Pacar Halusinasi nya",
          percentage: 0,
          amount: 0,
          formattedAmount: "",
        },
      ];
      percentageError.value = "";
      manualError.value = "";
    };

    const printResults = () => {
      window.print();
    };

    watch(totalBill, calculateSplit);
    watch(people, calculateSplit, { deep: true });
    watch(splitMethod, calculateSplit);

    return {
      totalBill,
      formattedBill,
      totalBillError,
      splitMethod,
      people,
      percentageError,
      manualError,
      currentDate,
      equalShare,
      remainingAmount,
      formatCurrency,
      formatCurrencyInput,
      formatPersonAmount,
      calculateSplit,
      setSplitMethod,
      addPerson,
      removePerson,
      resetCalculator,
      printResults,
    };
  },
}).mount("#app");
