package tn.paiezone.rh.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.paiezone.rh.domain.Advance;
import tn.paiezone.rh.domain.enumeration.AdvanceStatus;
import tn.paiezone.rh.repository.AdvanceRepository;
import tn.paiezone.rh.repository.PaySlipRepository;
import tn.paiezone.rh.service.dto.AdvanceDTO;
import tn.paiezone.rh.service.impl.AdvanceServiceImpl;
import tn.paiezone.rh.service.mapper.AdvanceMapper;

@ExtendWith(MockitoExtension.class)
class AdvanceWorkflowTest {

    @Mock
    AdvanceRepository advanceRepository;

    @Mock
    AdvanceMapper advanceMapper;

    @Mock
    PaySlipRepository paySlipRepository;

    @InjectMocks
    AdvanceServiceImpl advanceService;

    // ── TEST 1 : Approbation d'une avance REQUESTED ───────────────
    @Test
    void approveAdvance_statut_doitPasserAAPPROVED() {
        // Arrange
        Advance advance = new Advance();
        advance.setId(1L);
        advance.setAmount(new BigDecimal("500"));
        advance.setStatus(AdvanceStatus.REQUESTED);

        when(advanceRepository.findById(1L)).thenReturn(Optional.of(advance));
        when(advanceRepository.save(any(Advance.class))).thenReturn(advance);
        // Correction de l'ambiguïté ici :
        when(advanceMapper.toDto(any(Advance.class))).thenReturn(new AdvanceDTO());

        // Act
        advanceService.approveAdvance(1L, "rh.admin");

        // Assert
        assertThat(advance.getStatus()).isEqualTo(AdvanceStatus.APPROVED);
        assertThat(advance.getApprovedBy()).isEqualTo("rh.admin");
        assertThat(advance.getDeductionMonth()).isNotNull();
    }

    // ── TEST 2 : Impossible d'approuver une avance déjà rejetée ───
    @Test
    void approveAdvance_dejaRejete_doitLeverException() {
        // Arrange
        Advance advance = new Advance();
        advance.setId(1L);
        advance.setStatus(AdvanceStatus.REJECTED);

        when(advanceRepository.findById(1L)).thenReturn(Optional.of(advance));

        // Act & Assert
        assertThatThrownBy(() -> advanceService.approveAdvance(1L, "rh"))
            .isInstanceOf(IllegalStateException.class);
    }

    // ── TEST 3 : Rejet avec raison ───────────────────────────────
    @Test
    void rejectAdvance_doitEnregistrerLaRaison() {
        // Arrange
        Advance advance = new Advance();
        advance.setId(1L);
        advance.setStatus(AdvanceStatus.REQUESTED);

        when(advanceRepository.findById(1L)).thenReturn(Optional.of(advance));
        when(advanceRepository.save(any(Advance.class))).thenReturn(advance);
        // Correction de l'ambiguïté ici :
        when(advanceMapper.toDto(any(Advance.class))).thenReturn(new AdvanceDTO());

        // Act
        advanceService.rejectAdvance(1L, "Avance déjà accordée ce trimestre");

        // Assert
        assertThat(advance.getStatus()).isEqualTo(AdvanceStatus.REJECTED);
        assertThat(advance.getNotes()).contains("déjà accordée");
    }
}
