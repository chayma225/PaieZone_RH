package tn.paiezone.rh.service.dto;

import java.math.BigDecimal;
import java.util.List;

public class BulkCalculationResultDTO {

    private int totalEmployees;
    private int calculated;
    private int errors;
    private BigDecimal totalNetPayroll;
    private BigDecimal totalGrossPayroll;
    private List<String> errorDetails;
    public BulkCalculationResultDTO() {}

    public BulkCalculationResultDTO(int totalEmployees, int calculated, int errors,
                                    BigDecimal totalNetPayroll, BigDecimal totalGrossPayroll,
                                    List<String> errorDetails) {
        this.totalEmployees   = totalEmployees;
        this.calculated       = calculated;
        this.errors           = errors;
        this.totalNetPayroll  = totalNetPayroll;
        this.totalGrossPayroll = totalGrossPayroll;
        this.errorDetails     = errorDetails;
    }

    public int getTotalEmployees()           { return totalEmployees; }
    public void setTotalEmployees(int v)     { this.totalEmployees = v; }

    public int getCalculated()               { return calculated; }
    public void setCalculated(int v)         { this.calculated = v; }

    public int getErrors()                   { return errors; }
    public void setErrors(int v)             { this.errors = v; }

    public BigDecimal getTotalNetPayroll()   { return totalNetPayroll; }
    public void setTotalNetPayroll(BigDecimal v) { this.totalNetPayroll = v; }

    public BigDecimal getTotalGrossPayroll() { return totalGrossPayroll; }
    public void setTotalGrossPayroll(BigDecimal v) { this.totalGrossPayroll = v; }

    public List<String> getErrorDetails()   { return errorDetails; }
    public void setErrorDetails(List<String> v) { this.errorDetails = v; }
}
