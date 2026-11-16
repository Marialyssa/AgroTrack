package br.com.agrotrack.agrotrack.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "ocorrencias")
public class Ocorrencia {

	@Id
	private String id;
	private String nomeTalhao;
	private String cultura;
	private String doenca;
	private String severidade;
	private LocalDate dataOcorrencia;
	private String observacoes;

	public Ocorrencia() {
	}

	public Ocorrencia(String nomeTalhao, String cultura, String doenca, String severidade,
			LocalDate dataOcorrencia, String observacoes) {
		this.nomeTalhao = nomeTalhao;
		this.cultura = cultura;
		this.doenca = doenca;
		this.severidade = severidade;
		this.dataOcorrencia = dataOcorrencia;
		this.observacoes = observacoes;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getNomeTalhao() {
		return nomeTalhao;
	}

	public void setNomeTalhao(String nomeTalhao) {
		this.nomeTalhao = nomeTalhao;
	}

	public String getCultura() {
		return cultura;
	}

	public void setCultura(String cultura) {
		this.cultura = cultura;
	}

	public String getDoenca() {
		return doenca;
	}

	public void setDoenca(String doenca) {
		this.doenca = doenca;
	}

	public String getSeveridade() {
		return severidade;
	}

	public void setSeveridade(String severidade) {
		this.severidade = severidade;
	}

	public LocalDate getDataOcorrencia() {
		return dataOcorrencia;
	}

	public void setDataOcorrencia(LocalDate dataOcorrencia) {
		this.dataOcorrencia = dataOcorrencia;
	}

	public String getObservacoes() {
		return observacoes;
	}

	public void setObservacoes(String observacoes) {
		this.observacoes = observacoes;
	}
}
